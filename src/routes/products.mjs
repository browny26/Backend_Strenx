import express from "express";
import { checkSchema, validationResult } from "express-validator";
import {
  createProductValidationSchema,
  updateProductQuantitySchema,
  updateProductSchema,
} from "../utils/validationsSchemas.mjs";
import Product from "../mongoose/schemas/product.mjs"; // Assicurati che il percorso sia corretto

const router = express.Router();

router.get("/api/product", async (req, res) => {
  try {
    const { filter, value } = req.query;
    let query = {};

    if (filter && value) {
      query[filter] = { $regex: value, $options: "i" }; // Cerca in modo case-insensitive
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return res.status(404).send("Nessun prodotto trovato");
    }

    return res.status(200).json(products);
  } catch (err) {
    console.error("Errore nel recupero dei prodotti:", err);
    return res.status(500).send("Errore nel recupero dei prodotti");
  }
});

// Aggiungi un prodotto (crea un nuovo prodotto)
router.post(
  "/api/product",
  checkSchema(createProductValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, price, inStock, category, imageUrl } =
        req.body;

      // Crea un nuovo prodotto con i dati ricevuti
      const product = new Product({
        name,
        description,
        price,
        inStock,
        category,
        imageUrl,
      });

      // Salva il prodotto nel database
      await product.save();

      // Risposta con il prodotto creato
      return res.status(201).json(product);
    } catch (err) {
      // Gestisci gli errori di validazione e altri errori
      console.error("Errore nella creazione del prodotto:", err);
      return res.status(400).json({
        message: "Errore nella creazione del prodotto",
        error: err.message,
      });
    }
  }
);

router.put(
  "/api/product/:productId/quantity",
  checkSchema(updateProductQuantitySchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId } = req.params;
      const { inStock } = req.body;

      // Trova il prodotto per ID
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }

      // Aggiorna la quantità disponibile
      product.inStock = inStock;
      await product.save();

      return res.status(200).json({
        message: "Quantità prodotto aggiornata con successo",
        product,
      });
    } catch (err) {
      console.error("Errore nell'aggiornamento della quantità:", err);
      return res.status(500).json({ message: "Errore del server" });
    }
  }
);

router.put(
  "/api/product/:productId",
  checkSchema(updateProductSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId } = req.params;
      const updateFields = req.body;

      const product = await Product.findByIdAndUpdate(productId, updateFields, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({ message: "Prodotto non trovato" });
      }

      return res
        .status(200)
        .json({ message: "Prodotto aggiornato con successo", product });
    } catch (err) {
      console.error("Errore nell'aggiornamento del prodotto:", err);
      return res.status(500).json({ message: "Errore del server" });
    }
  }
);

// Rimuovi prodotto dalla tabella Products
router.delete("/api/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params; // Recupera l'ID del prodotto dalla richiesta

    if (!productId) {
      return res.status(400).json({ message: "Prodotto ID è richiesto." });
    }

    // Trova e rimuovi il prodotto dalla tabella Products
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato." });
    }

    // Restituisci una risposta di successo
    return res
      .status(200)
      .json({ message: "Prodotto eliminato con successo." });
  } catch (err) {
    console.error("Errore nell'eliminare il prodotto:", err);
    return res
      .status(500)
      .json({ message: "Errore nel server", error: err.message });
  }
});

export default router;
