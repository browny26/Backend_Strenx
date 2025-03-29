import { v4 as uuidv4 } from "uuid";
import Cart from "../../mongoose/schemas/cart.mjs";

const cartMiddleware = async (req, res, next) => {
  try {
    let cart;

    if (req.isAuthenticated()) {
      // Cerca un carrello esistente per l'utente
      cart = await Cart.findOne({ userId: req.user._id });

      if (!cart) {
        // Se non ha un carrello, creane uno nuovo
        cart = new Cart({ userId: req.user._id, items: [] });
        await cart.save();
      }
    } else {
      // Se non è autenticato, non c'è un carrello
      cart = null;
    }

    req.cart = cart; // Salva il carrello nella richiesta
    next(); // Continua con la richiesta
  } catch (err) {
    console.error("Errore nel middleware del carrello:", err);
    next(err);
  }
};

export default cartMiddleware;
