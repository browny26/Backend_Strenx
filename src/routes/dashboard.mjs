import { Router } from "express";
import { isAdmin } from "../utils/middlewares/auth.mjs";

const router = Router();

router.get("/dashboard", isAdmin, (req, res) => {
  res.send("Benvenuto nella dashboard admin!");
});

export default router;
