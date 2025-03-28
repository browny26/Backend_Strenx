export const createUserValidationSchema = {
  username: {
    isLength: {
      options: {
        min: 5,
        max: 32,
      },
      errorMessage: "Username deve avere minimo 5 e massimo 32 caratteri",
    },
    notEmpty: {
      errorMessage: "Username non può essere vuoto",
    },
    isString: { errorMessage: "Username deve essere una stringa" },
  },
  displayName: {
    notEmpty: true,
  },
  password: {
    notEmpty: true,
  },
  email: {
    isEmail: {
      errorMessage: "Email non valida",
    },
    notEmpty: {
      errorMessage: "Email non può essere vuota",
    },
  },
  role: {
    notEmpty: {
      errorMessage: "Role non può essere vuoto",
    },
    isIn: {
      options: [["admin", "user", "moderator"]], // Aggiungi i ruoli consentiti
      errorMessage: "Role deve essere uno dei seguenti: admin, user, moderator",
    },
  },
};

export const queryValidationSchema = {
  filter: {
    isLength: {
      options: {
        min: 3,
        max: 10,
      },
      errorMessage: "Deve avere almeno 3-10 caratteri",
    },
    notEmpty: {
      errorMessage: "Non deve essere vuoto",
    },
    isString: true,
  },
};
