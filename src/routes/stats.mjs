import { Router } from "express";
import Visitor from "../mongoose/schemas/visitor.mjs";

const router = Router();

router.get("/api/visitors", async (req, res) => {
  try {
    const visitor = await Visitor.findOne();
    const count = visitor ? visitor.count : 0;
    return res.status(200).json({ uniqueVisitors: count });
  } catch (err) {
    console.error("Errore nel recupero dei visitatori:", err);
    return res.status(500).send("Errore nel recupero dei visitatori");
  }
});

export default router;
