import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import MongoStore from "connect-mongo";
import routes from "./routes/index.mjs";
import { DB_URL, PORT } from "./utils/costants.mjs";

const app = express();

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
      maxAge: 60000 * 60,
    },
    store: MongoStore.create({ client: mongoose.connection.getClient() }), // salva la sessione nel db cosi che se il server si riavvia rimani loggato
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
