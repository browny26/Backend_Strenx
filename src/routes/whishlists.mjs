import { Router } from "express";
import Whishlist from "../mongoose/schemas/whishlist.mjs";
import Product from "../mongoose/schemas/product.mjs";

const router = Router();

router.get("/api/whishlist", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Non autenticato");
    }

    const userId = req.user._id; // Ottieni l'ID dell'utente dalla sessione
    const whishlist = await Whishlist.findOne({ userId });

    if (!whishlist) {
      return res.status(404).send("Carrello non trovato");
    }

    return res.status(200).send(whishlist); // Restituisce il carrello dell'utente
  } catch (err) {
    console.error("Errore nel recupero della whishlist:", err);
    return res.status(500).send("Errore nel recupero della whishlist");
  }
});

router.get("/api/whishlist/all", async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res
        .status(403)
        .send(
          "Accesso negato: solo gli amministratori possono visualizzare tutte le whishlist"
        );
    }

    const whishlists = await Whishlist.find(); // Trova tutti i whishlist

    if (!whishlists || whishlists.length === 0) {
      return res.status(404).send("Nessuna whishlist trovato");
    }

    return res.status(200).send(whishlists); // Restituisce tutti i whishlist
  } catch (err) {
    console.error("Errore nel recupero delle whishlist:", err);
    return res.status(500).send("Errore nel recupero delle whishlist");
  }
});

// Aggiungi prodotto alla whishlist
router.post("/api/whishlist/add", async (req, res) => {
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

    let whishlist;

    // Se l'utente è autenticato, usa il suo userId, altrimenti usa sessionId
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      whishlist = await Whishlist.findOne({ userId });

      if (!whishlist) {
        whishlist = new Whishlist({ userId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel whishlist
      const itemIndex = whishlist.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        whishlist.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        whishlist.items.push({ productId, quantity });
      }
    } else {
      const sessionId = req.session.id;
      whishlist = await Whishlist.findOne({ sessionId });

      if (!whishlist) {
        whishlist = new Whishlist({ sessionId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel whishlist
      const itemIndex = whishlist.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        whishlist.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        whishlist.items.push({ productId, quantity });
      }
    }

    // Salva il whishlist aggiornato
    await whishlist.save();

    return res.status(200).json(whishlist);
  } catch (err) {
    console.error("Errore nell'aggiungere il prodotto al whishlist:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Modifica la quantità di un prodotto nel whishlist
router.put("/api/whishlist/:productId", async (req, res) => {
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
    let whishlist = await Whishlist.findOne({ userId: req.user._id });

    if (!whishlist) {
      return res.status(404).json({ message: "whishlist non trovato." });
    }

    // Trova il prodotto nel whishlist
    const itemIndex = whishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Prodotto non trovato nel carrello." });
    }

    // Modifica la quantità del prodotto nel whishlist
    whishlist.items[itemIndex].quantity = quantity;

    // Salva le modifiche al whishlist
    await whishlist.save();

    return res.status(200).json({
      message: "Quantità del prodotto aggiornata con successo.",
      whishlist,
    });
  } catch (err) {
    console.error("Errore nell'aggiornare la quantità del prodotto:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Rimuovi prodotto dal whishlist
router.delete("/api/whishlist/remove", async (req, res) => {
  try {
    const { productId } = req.body; // Recupera l'ID del prodotto da eliminare

    if (!productId) {
      return res.status(400).json({ message: "Prodotto ID è richiesto." });
    }

    // Verifica se l'utente è autenticato
    let whishlist;
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      whishlist = await Whishlist.findOne({ userId });

      if (!whishlist) {
        return res
          .status(404)
          .json({ message: "whishlist non trovato per l'utente." });
      }

      // Rimuovi il prodotto dal whishlist
      whishlist.items = whishlist.items.filter(
        (item) => item.productId.toString() !== productId
      );
    } else {
      const sessionId = req.session.id;
      whishlist = await Whishlist.findOne({ sessionId });

      if (!whishlist) {
        return res
          .status(404)
          .json({ message: "whishlist non trovato per la sessione." });
      }

      // Rimuovi il prodotto dal whishlist
      whishlist.items = whishlist.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    // Salva il whishlist aggiornato
    await whishlist.save();

    // Restituisci il whishlist aggiornato
    return res.status(200).json(whishlist);
  } catch (err) {
    console.error("Errore nell'eliminare il prodotto dal whishlist:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

export default router;
