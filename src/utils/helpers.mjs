import bcrypt from "bcrypt";

const saltRounds = 10;

// criptare password
export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  console.log(salt);

  return bcrypt.hashSync(password, salt);
};

// compara password criptata con password plain
export const comparePassword = (plain, hashed) => {
  return bcrypt.compareSync(plain, hashed);
};
