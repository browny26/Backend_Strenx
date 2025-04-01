import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import routes from "./routes/index.mjs";
import { DB_URL, PORT } from "./utils/costants.mjs";
import "./strategies/local-strategy.mjs";
import cartMiddleware from "./utils/middlewares/cartMiddleware.mjs";
import wishlistMiddleware from "./utils/middlewares/wishlistMiddlware.mjs";
import trackVisitor from "./utils/middlewares/visitorMiddleware.mjs";

const app = express();
// Configura CORS per permettere solo richieste da http://localhost:5173
const corsOptions = {
  origin: "http://localhost:5173", // Cambia con l'URL della tua app React
  methods: ["GET", "POST", "PUT", "DELETE"], // Puoi specificare i metodi consentiti
  allowedHeaders: ["Content-Type", "Authorization"], // Aggiungi eventuali header necessari
};

mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error ${err}`));

app.use(express.json());
app.use(
  session({
    secret: "luisacerin",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60 * 24,
    },
    store: MongoStore.create({ client: mongoose.connection.getClient() }), // salva la sessione nel db cosi che se il server si riavvia rimani loggato
  })
);
app.use(cors()); // Aggiungi il middleware CORS alla tua app Express
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(cartMiddleware);
app.use(wishlistMiddleware);
app.use(trackVisitor);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
