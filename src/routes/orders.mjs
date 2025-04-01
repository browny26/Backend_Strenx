import { Router } from "express";
import Order from "../mongoose/schemas/order.mjs";
import Cart from "../mongoose/schemas/cart.mjs";
import Product from "../mongoose/schemas/product.mjs";

const router = Router();

// Crea un nuovo ordine
router.post("/api/orders/new", async (req, res) => {
  try {
    const { userId, items } = req.body;

    // Recupera i prodotti dal database in un'unica query
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Calcola il totale dell'ordine
    let total = 0;
    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString()
      );
      if (!product) {
        return res
          .status(400)
          .send(`Prodotto con ID ${item.productId} non trovato.`);
      }
      total += product.price * item.quantity; // Totale = prezzo * quantità
    }

    // Crea l'ordine
    const newOrder = new Order({
      userId,
      items,
      total,
      status: "Processing", // Imposta lo stato iniziale
    });

    // Salva l'ordine nel database
    await newOrder.save();

    // Svuota il carrello dell'utente dopo l'ordine
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = []; // Rimuove tutti gli items dal carrello
      await cart.save();
    }

    // Risponde con il nuovo ordine e il carrello vuoto
    return res.status(201).json({
      order: newOrder,
      message: "Ordine effettuato con successo. Il carrello è stato svuotato.",
    });
  } catch (err) {
    console.error("Errore nella creazione dell'ordine:", err);
    return res.status(500).send("Errore nella creazione dell'ordine");
  }
});

// Ottieni tutti gli ordini di un utente
router.get("/api/orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Trova tutti gli ordini dell'utente
    const orders = await Order.find({ userId }).populate("items.productId"); // Popola i dettagli dei prodotti

    if (orders.length === 0) {
      return res.status(404).send("Nessun ordine trovato per questo utente");
    }

    return res.status(200).json(orders);
  } catch (err) {
    console.error("Errore nel recupero degli ordini:", err);
    return res.status(500).send("Errore nel recupero degli ordini");
  }
});

// Modifica lo stato di un ordine (ad esempio, per cambiare lo stato da "In lavorazione" a "Spedito")
router.put("/api/orders/status/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Verifica che lo stato sia valido
    const validStatuses = [
      "Processing",
      "In Arrival",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).send("Stato dell'ordine non valido");
    }

    // Trova e aggiorna l'ordine
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Restituisce il documento aggiornato
    );

    if (!order) {
      return res.status(404).send("Ordine non trovato");
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error("Errore nella modifica dell'ordine:", err);
    return res.status(500).send("Errore nella modifica dell'ordine");
  }
});

// Ottieni tutti gli ordini
router.get("/api/orders", async (req, res) => {
  try {
    // Trova tutti gli ordini
    const orders = await Order.find().populate("items.productId"); // Popola i dettagli dei prodotti

    if (orders.length === 0) {
      return res.status(404).send("Nessun ordine trovato");
    }

    return res.status(200).json(orders);
  } catch (err) {
    console.error("Errore nel recupero degli ordini:", err);
    return res.status(500).send("Errore nel recupero degli ordini");
  }
});

// Elimina un ordine (per esempio, in caso di cancellazione)
router.delete("/api/orders/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Elimina l'ordine
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).send("Ordine non trovato");
    }

    return res.status(200).send("Ordine eliminato con successo");
  } catch (err) {
    console.error("Errore nell'eliminazione dell'ordine:", err);
    return res.status(500).send("Errore nell'eliminazione dell'ordine");
  }
});

export default router;
