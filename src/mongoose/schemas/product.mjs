import mongoose from "mongoose";

// Definizione dello schema per i prodotti
const productSchema = new mongoose.Schema({
  name: { type: mongoose.SchemaTypes.String, required: true },
  description: { type: mongoose.SchemaTypes.String, required: true },
  price: { type: mongoose.SchemaTypes.Number, required: true },
  inStock: { type: mongoose.SchemaTypes.Number, required: true },
  rate: { type: mongoose.SchemaTypes.Number, default: 0 },
  category: { type: mongoose.SchemaTypes.String, required: true },
  imageUrl: { type: mongoose.SchemaTypes.String }, // opzionale: URL per l'immagine del prodotto
});

const Product = mongoose.model("Product", productSchema);

export default Product;
