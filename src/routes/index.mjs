import { Router } from "express";

import userRouter from "./users.mjs";
import authRouter from "./auth.mjs";
import cartRouter from "./carts.mjs";
import productRouter from "./products.mjs"; // Assicurati che il percorso sia corretto

const router = Router();

router.use(authRouter);
router.use(userRouter);
router.use(cartRouter);
router.use(productRouter);

export default router;
