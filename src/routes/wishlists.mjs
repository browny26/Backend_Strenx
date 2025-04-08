import { Router } from "express";
import Wishlist from "../mongoose/schemas/wishlist.mjs";
import Product from "../mongoose/schemas/product.mjs";

const router = Router();

router.get("/api/wishlist", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Non autenticato");
    }

    const userId = req.user._id; // Ottieni l'ID dell'utente dalla sessione
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).send("Whislist non trovata");
    }

    return res.status(200).send(wishlist); // Restituisce il carrello dell'utente
  } catch (err) {
    console.error("Errore nel recupero della wishlist:", err);
    return res.status(500).send("Errore nel recupero della wishlist");
  }
});

router.get("/api/wishlist/all", async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res
        .status(403)
        .send(
          "Accesso negato: solo gli amministratori possono visualizzare tutte le wishlist"
        );
    }

    const wishlists = await Wishlist.find(); // Trova tutti i whishlist

    if (!wishlists || wishlists.length === 0) {
      return res.status(404).send("Nessuna wishlist trovato");
    }

    return res.status(200).send(wishlists); // Restituisce tutti i whishlist
  } catch (err) {
    console.error("Errore nel recupero delle wishlist:", err);
    return res.status(500).send("Errore nel recupero delle wishlist");
  }
});

// Aggiungi prodotto alla wishlist
router.post("/api/wishlist/add", async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Recupera i dati del prodotto e quantità dalla richiesta

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Prodotto e quantità sono richiesti." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato." });
    }

    let wishlist;

    // Se l'utente è autenticato, usa il suo userId, altrimenti usa sessionId
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      wishlist = await Wishlist.findOne({ userId });

      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel whishlist
      const itemIndex = wishlist.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        wishlist.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        wishlist.items.push({ productId, quantity });
      }
    } else {
      const sessionId = req.session.id;
      wishlist = await Wishlist.findOne({ sessionId });

      if (!wishlist) {
        wishlist = new Wishlist({ sessionId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel whishlist
      const itemIndex = wishlist.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        wishlist.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        wishlist.items.push({ productId, quantity });
      }
    }

    // Salva il whishlist aggiornato
    await wishlist.save();

    return res.status(200).json(wishlist);
  } catch (err) {
    console.error("Errore nell'aggiungere il prodotto al wishlist:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Modifica la quantità di un prodotto nel whishlist
router.put("/api/wishlist/:productId", async (req, res) => {
  try {
    const { productId } = req.params; // ID del prodotto da aggiornare
    const { quantity } = req.body; // Nuova quantità

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "La quantità deve essere maggiore di 0." });
    }

    // Verifica che il prodotto esista
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato." });
    }

    // Verifica che l'utente sia autenticato
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Devi essere autenticato per modificare il carrello.",
      });
    }

    // Trova il whishlist dell'utente
    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "wishlist non trovato." });
    }

    // Trova il prodotto nel wishlist
    const itemIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Prodotto non trovato nel carrello." });
    }

    // Modifica la quantità del prodotto nel whishlist
    wishlist.items[itemIndex].quantity = quantity;

    // Salva le modifiche al whishlist
    await wishlist.save();

    return res.status(200).json({
      message: "Quantità del prodotto aggiornata con successo.",
      wishlist,
    });
  } catch (err) {
    console.error("Errore nell'aggiornare la quantità del prodotto:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Rimuovi prodotto dal whishlist
router.delete("/api/wishlist/remove", async (req, res) => {
  try {
    const { productId } = req.body; // Recupera l'ID del prodotto da eliminare

    if (!productId) {
      return res.status(400).json({ message: "Prodotto ID è richiesto." });
    }

    // Verifica se l'utente è autenticato
    let wishlist;
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      wishlist = await Wishlist.findOne({ userId });

      if (!wishlist) {
        return res
          .status(404)
          .json({ message: "wishlist non trovato per l'utente." });
      }

      // Rimuovi il prodotto dal whishlist
      wishlist.items = wishlist.items.filter(
        (item) => item.productId.toString() !== productId
      );
    } else {
      const sessionId = req.session.id;
      wishlist = await Wishlist.findOne({ sessionId });

      if (!wishlist) {
        return res
          .status(404)
          .json({ message: "wishlist non trovato per la sessione." });
      }

      // Rimuovi il prodotto dal wishlist
      wishlist.items = wishlist.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    // Salva il whishlist aggiornato
    await wishlist.save();

    // Restituisci il whishlist aggiornato
    return res.status(200).json(wishlist);
  } catch (err) {
    console.error("Errore nell'eliminare il prodotto dal wishlist:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

export default router;
