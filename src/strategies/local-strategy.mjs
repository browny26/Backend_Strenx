import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword, hashPassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  console.log("Serialize user");
  console.log(user);

  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserialize user");
  console.log(`User id: ${id}`);

  try {
    // const findUser = mockUsers.find((user) => user.id === id);

    const findUser = await User.findById(id);

    if (!findUser) throw new Error("User not found");

    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});

export default passport.use(
  new Strategy(async (username, password, done) => {
    /*  console.log(`Username: ${username}`);
    console.log(`Password: ${password}`); */

    try {
      /* const findUser = mockUsers.find((user) => user.username === username);

      if (!findUser) throw new Error("User not found");
      if (findUser.password !== password)
        throw new Error("Invalid Credentials"); 

      done(null, findUser);*/

      const findUser = await User.findOne({ username });

      if (!findUser) throw new Error("User not found");
      if (!comparePassword(password, findUser.password))
        throw new Error("Invalid Credentials");

      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);
