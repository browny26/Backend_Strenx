import { Router } from "express";
import passport from "passport";

const router = Router();

router.post("/api/auth", passport.authenticate("local"), (req, res) => {
  res.sendStatus(200);
});

router.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  req.logout((err) => {
    if (err) return res.sendStatus(400);
  });

  return res.sendStatus(200);
});

router.get("/api/auth/status", (req, res) => {
  console.log("/auth/status endpoint");
  console.log(req.user);
  console.log(req.session);

  return req.user ? res.send(req.user) : res.sendStatus(401);
});

export default router;
