import Visitor from "../../mongoose/schemas/visitor.mjs";
import { v4 as uuidv4 } from "uuid";

const trackVisitor = async (req, res, next) => {
  try {
    let visitorId = req.cookies.visitorId;

    if (!visitorId) {
      // Nuovo visitatore → crea un ID univoco
      visitorId = uuidv4();
      res.cookie("visitorId", visitorId, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      }); // Valido 30 giorni

      // Aggiorna il database solo per nuovi visitatori
      let visitor = await Visitor.findOne();
      if (!visitor) {
        visitor = new Visitor({ count: 1 });
      } else {
        visitor.count += 1;
      }
      await visitor.save();
    }

    next();
  } catch (err) {
    console.error("Errore nel tracking dei visitatori:", err);
    next();
  }
};

export default trackVisitor;
