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
    isIn: {
      options: [["admin", "user"]], // Aggiungi i ruoli consentiti
      errorMessage: "Role deve essere uno dei seguenti: admin o user",
    },
  },
};

export const createProductValidationSchema = {
  name: {
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: "Il nome del prodotto deve avere tra 3 e 100 caratteri",
    },
    notEmpty: {
      errorMessage: "Il nome del prodotto non può essere vuoto",
    },
    isString: {
      errorMessage: "Il nome del prodotto deve essere una stringa",
    },
  },
  description: {
    isLength: {
      options: { min: 10 },
      errorMessage:
        "La descrizione del prodotto deve avere almeno 10 caratteri",
    },
    notEmpty: {
      errorMessage: "La descrizione del prodotto non può essere vuota",
    },
    isString: {
      errorMessage: "La descrizione del prodotto deve essere una stringa",
    },
  },
  price: {
    isFloat: {
      options: { min: 0 },
      errorMessage: "Il prezzo deve essere un numero positivo",
    },
    notEmpty: {
      errorMessage: "Il prezzo del prodotto non può essere vuoto",
    },
  },
  inStock: {
    isInt: {
      options: { min: 1 },
      errorMessage: "La quantità deve essere almeno 1",
    },
    notEmpty: {
      errorMessage: "La quantità del prodotto non può essere vuota",
    },
  },
  category: {
    isArray: {
      errorMessage: "La categoria deve essere un array di stringhe",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return false;
        return value.every((v) => typeof v === "string");
      },
      errorMessage: "Ogni elemento della categoria deve essere una stringa",
    },
    notEmpty: {
      errorMessage: "La categoria del prodotto non può essere vuoto",
    },
  },
  tags: {
    optional: {
      options: { nullable: true },
    },
    isArray: {
      errorMessage: "I tag devono essere un array di stringhe",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return false;
        return value.every((v) => typeof v === "string");
      },
      errorMessage: "Ogni tag deve essere una stringa",
    },
  },
  size: {
    optional: {
      options: { nullable: true },
    },
    isArray: {
      errorMessage: "Le dimensioni devono essere un array di stringhe",
    },
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) return false;
        return value.every((v) => typeof v === "string");
      },
      errorMessage: "Ogni dimensione deve essere una stringa",
    },
  },
  imageUrl: {
    optional: {
      options: { nullable: true },
    },
    matches: {
      options: [/.*\.(jpeg|jpg|png|gif)$/i],
      errorMessage:
        "L'URL dell'immagine deve un'estensione valida (jpeg, jpg, png, gif)",
    },
  },
};

export const updateProductQuantitySchema = {
  inStock: {
    notEmpty: {
      errorMessage: "Lo stock non può essere vuoto",
    },
    isInt: {
      options: { min: 0 },
      errorMessage: "Lo stock deve essere un numero intero positivo",
    },
    toInt: true, // Converte il valore a intero
  },
};

export const updateProductSchema = {
  name: {
    optional: true,
    isString: { errorMessage: "Il nome deve essere una stringa" },
    trim: true,
  },
  price: {
    optional: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: "Il prezzo deve essere un numero positivo",
    },
    toFloat: true,
  },
  inStock: {
    optional: true,
    isInt: {
      options: { min: 0 },
      errorMessage: "Lo stock deve essere un numero intero positivo",
    },
    toInt: true,
  },
  category: {
    optional: true,
    isString: { errorMessage: "La categoria deve essere una stringa" },
    trim: true,
  },
  description: {
    optional: true,
    isString: { errorMessage: "La descrizione deve essere una stringa" },
    trim: true,
  },
};
