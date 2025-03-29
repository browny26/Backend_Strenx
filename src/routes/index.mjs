import { Router } from "express";

import userRouter from "./users.mjs";
import authRouter from "./auth.mjs";
import dashboardRouter from "./dashboard.mjs";
import cartRouter from "./carts.mjs";
import productRouter from "./products.mjs";
import wishlistRouter from "./wishlists.mjs";

const router = Router();

router.use(authRouter);
router.use(userRouter);
router.use(dashboardRouter);
router.use(cartRouter);
router.use(productRouter);
router.use(wishlistRouter);

export default router;
