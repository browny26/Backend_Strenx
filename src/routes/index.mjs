import { Router } from "express";

import userRouter from "./users.mjs";
import authRouter from "./auth.mjs";

const router = Router();

router.use(userRouter);
router.use(authRouter);

export default router;
