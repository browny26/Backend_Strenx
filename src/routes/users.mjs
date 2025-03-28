import { Router } from "express";
import { validationResult, matchedData, checkSchema } from "express-validator";
import {
  queryValidationSchema,
  createUserValidationSchema,
} from "../utils/validationsSchemas.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { hashPassword } from "../utils/helpers.mjs";

const router = Router();

// Recupero di tutti gli utenti dal database
router.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Usa il modello User per ottenere tutti gli utenti
    return res.status(200).send(users);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500); // Errore interno del server
  }
});

// creazione e inserimento di un utente nel database
router.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) return res.status(400).send(result.array());

    const data = matchedData(req);
    data.password = hashPassword(data.password);
    const newUser = new User(data);

    console.log(data);

    try {
      const savedUser = await newUser.save();
      return res.status(201).send(savedUser);
    } catch (err) {
      console.log(err);
      return res.sendStatus(400);
    }
  }
);

// Recupero di un utente per ID
router.get("/api/users/:id", async (req, res) => {
  const { id } = req.params; // Ottieni l'id dai parametri della richiesta

  try {
    const user = await User.findById(id); // Trova l'utente per ID

    if (!user) {
      return res.status(404).send({ message: "Utente non trovato" });
    }

    return res.status(200).send(user); // Restituisce l'utente trovato
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Errore interno del server" });
  }
});

// Aggiornamento completo di un utente per ID (PUT)
router.put("/api/users/:id", async (req, res) => {
  const { id } = req.params; // Ottieni l'id dai parametri della richiesta
  const updatedData = req.body; // I dati da aggiornare

  try {
    // Trova l'utente per ID e aggiorna tutti i campi
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!user) {
      return res.status(404).send({ message: "Utente non trovato" });
    }

    return res.status(200).send(user); // Restituisce l'utente aggiornato
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Errore interno del server" });
  }
});

// Aggiornamento parziale di un utente per ID (PATCH)
router.patch("/api/users/:id", async (req, res) => {
  const { id } = req.params; // Ottieni l'id dai parametri della richiesta
  const updatedData = req.body; // I dati da aggiornare (parziali)

  try {
    // Trova l'utente per ID e aggiorna solo i campi che sono stati inviati
    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!user) {
      return res.status(404).send({ message: "Utente non trovato" });
    }

    return res.status(200).send(user); // Restituisce l'utente aggiornato
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Errore interno del server" });
  }
});

// Eliminazione di un utente per ID
router.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params; // Ottieni l'id dai parametri della richiesta

  try {
    // Trova l'utente per ID e lo elimina
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send({ message: "Utente non trovato" });
    }

    return res.status(200).send({ message: "Utente eliminato con successo" }); // Conferma l'eliminazione
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Errore interno del server" });
  }
});

export default router;
