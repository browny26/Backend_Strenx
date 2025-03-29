import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: mongoose.SchemaTypes.String, required: true },
  email: { type: mongoose.SchemaTypes.String, required: true, unique: true },
  displayName: mongoose.SchemaTypes.String,
  password: { type: mongoose.SchemaTypes.String, required: true },
  role: { type: mongoose.SchemaTypes.String, default: "user" },
});

export const User = mongoose.model("User", UserSchema);
