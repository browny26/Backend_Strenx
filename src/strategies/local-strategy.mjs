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
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    try {
      const findUser = await User.findOne({ email });

      if (!findUser) return done(null, false, { message: "User not found" });
      if (!comparePassword(password, findUser.password))
        return done(null, false, { message: "Invalid Credentials" });

      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);
