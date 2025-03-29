export const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(404).send("Pagina non trovata");
  }

  if (req.user.role !== "admin") {
    return res.status(404).send("Pagina non trovata");
  }

  next(); // L'utente è admin, continua
};

// export const isAdmin = (req, res, next) => {
//   if (!req.isAuthenticated() || req.user.role !== "admin") {
//     return res.redirect("/404"); // Reindirizza alla tua pagina 404
//   }

//   next();
// };
