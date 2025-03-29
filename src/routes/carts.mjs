import { Router } from "express";
import Cart from "../mongoose/schemas/cart.mjs";
import Product from "../mongoose/schemas/product.mjs";

const router = Router();

router.get("/api/cart", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Non autenticato");
    }

    const userId = req.user._id; // Ottieni l'ID dell'utente dalla sessione
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).send("Carrello non trovato");
    }

    return res.status(200).send(cart); // Restituisce il carrello dell'utente
  } catch (err) {
    console.error("Errore nel recupero del carrello:", err);
    return res.status(500).send("Errore nel recupero del carrello");
  }
});

router.get("/api/cart/all", async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res
        .status(403)
        .send(
          "Accesso negato: solo gli amministratori possono visualizzare tutti i carrelli"
        );
    }

    const carts = await Cart.find(); // Trova tutti i carrelli

    if (!carts || carts.length === 0) {
      return res.status(404).send("Nessun carrello trovato");
    }

    return res.status(200).send(carts); // Restituisce tutti i carrelli
  } catch (err) {
    console.error("Errore nel recupero dei carrelli:", err);
    return res.status(500).send("Errore nel recupero dei carrelli");
  }
});

// Aggiungi prodotto al carrello
router.post("/api/cart/add", async (req, res) => {
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

    let cart;

    // Se l'utente è autenticato, usa il suo userId, altrimenti usa sessionId
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel carrello
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        cart.items.push({ productId, quantity });
      }
    } else {
      const sessionId = req.session.id;
      cart = await Cart.findOne({ sessionId });

      if (!cart) {
        cart = new Cart({ sessionId, items: [] });
      }

      // Aggiungi o aggiorna il prodotto nel carrello
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity; // Aggiungi la quantità al prodotto esistente
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    // Salva il carrello aggiornato
    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error("Errore nell'aggiungere il prodotto al carrello:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Modifica la quantità di un prodotto nel carrello
router.put("/api/cart/:productId", async (req, res) => {
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
      return res
        .status(401)
        .json({
          message: "Devi essere autenticato per modificare il carrello.",
        });
    }

    // Trova il carrello dell'utente
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Carrello non trovato." });
    }

    // Trova il prodotto nel carrello
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Prodotto non trovato nel carrello." });
    }

    // Modifica la quantità del prodotto nel carrello
    cart.items[itemIndex].quantity = quantity;

    // Salva le modifiche al carrello
    await cart.save();

    return res
      .status(200)
      .json({
        message: "Quantità del prodotto aggiornata con successo.",
        cart,
      });
  } catch (err) {
    console.error("Errore nell'aggiornare la quantità del prodotto:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

// Rimuovi prodotto dal carrello
router.delete("/api/cart/remove", async (req, res) => {
  try {
    const { productId } = req.body; // Recupera l'ID del prodotto da eliminare

    if (!productId) {
      return res.status(400).json({ message: "Prodotto ID è richiesto." });
    }

    // Verifica se l'utente è autenticato
    let cart;
    if (req.isAuthenticated()) {
      const userId = req.user._id;
      cart = await Cart.findOne({ userId });

      if (!cart) {
        return res
          .status(404)
          .json({ message: "Carrello non trovato per l'utente." });
      }

      // Rimuovi il prodotto dal carrello
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    } else {
      const sessionId = req.session.id;
      cart = await Cart.findOne({ sessionId });

      if (!cart) {
        return res
          .status(404)
          .json({ message: "Carrello non trovato per la sessione." });
      }

      // Rimuovi il prodotto dal carrello
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }

    // Salva il carrello aggiornato
    await cart.save();

    // Restituisci il carrello aggiornato
    return res.status(200).json(cart);
  } catch (err) {
    console.error("Errore nell'eliminare il prodotto dal carrello:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

export default router;
