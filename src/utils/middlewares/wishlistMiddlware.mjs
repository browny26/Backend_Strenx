import { v4 as uuidv4 } from "uuid";
import Wishlist from "../../mongoose/schemas/wishlist.mjs";

const wishlistMiddleware = async (req, res, next) => {
  try {
    let wishlist;

    if (req.isAuthenticated()) {
      // Cerca un whishlist esistente per l'utente
      wishlist = await Wishlist.findOne({ userId: req.user._id });

      if (!wishlist) {
        // Se non ha un carrello, creane uno nuovo
        wishlist = new Wishlist({ userId: req.user._id, items: [] });
        await wishlist.save();
      }
    } else {
      // Se non è autenticato, non c'è un whishlist
      wishlist = null;
    }

    req.wishlist = wishlist; // Salva il whishlist nella richiesta
    next(); // Continua con la richiesta
  } catch (err) {
    console.error("Errore nel middleware della wishlist:", err);
    next(err);
  }
};

export default wishlistMiddleware;
