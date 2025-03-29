import { Router } from "express";
import passport from "passport";
import Cart from "../mongoose/schemas/cart.mjs"; // Assicurati che il percorso sia corretto
import Whishlist from "../mongoose/schemas/whishlist.mjs";
const router = Router();

router.post(
  "/api/auth/login",
  passport.authenticate("local"),
  async (req, res) => {
    try {
      const userId = req.user._id;

      // 🔹 Salva l'ID dell'utente nella sessione
      req.session.userId = userId;

      // 🔹 Controlla se il carrello esiste
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
        await cart.save();
      }

      // 🔹 Controlla se la wishlist esiste
      let wishlist = await Whishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Whishlist({ userId, items: [] });
        await wishlist.save();
      }

      // 🔹 Salva gli ID nella sessione
      req.session.cartId = cart._id;
      req.session.wishlistId = wishlist._id;

      return res.status(200).json({ cart, wishlist }); // 🔹 Risponde con entrambi
    } catch (err) {
      console.error("Errore nel login:", err);
      return res.status(500).send("Errore durante il login");
    }
  }
);

router.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  req.logout((err) => {
    if (err) return res.status(500).send("Errore nel logout");

    req.session.destroy((err) => {
      if (err)
        return res.status(500).send("Errore nel distruggere la sessione");

      res.clearCookie("connect.sid"); // Rimuove il cookie della sessione
      return res.sendStatus(200);
    });
  });
});

router.get("/api/auth/status", (req, res) => {
  console.log("/auth/status endpoint");
  console.log(req.user);
  console.log(req.session);

  return req.user ? res.send(req.user) : res.sendStatus(401);
});

export default router;
