import { v4 as uuidv4 } from "uuid";
import Whishlist from "../../mongoose/schemas/whishlist.mjs";

const whishlistMiddleware = async (req, res, next) => {
  try {
    let whishlist;

    if (req.isAuthenticated()) {
      // Cerca un whishlist esistente per l'utente
      whishlist = await Whishlist.findOne({ userId: req.user._id });

      if (!whishlist) {
        // Se non ha un carrello, creane uno nuovo
        whishlist = new Whishlist({ userId: req.user._id, items: [] });
        await whishlist.save();
      }
    } else {
      // Se non è autenticato, non c'è un whishlist
      whishlist = null;
    }

    req.whishlist = whishlist; // Salva il whishlist nella richiesta
    next(); // Continua con la richiesta
  } catch (err) {
    console.error("Errore nel middleware della whishlist:", err);
    next(err);
  }
};

export default whishlistMiddleware;
