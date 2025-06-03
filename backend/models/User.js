import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  followings: [{ type: String }],
  followers: [{ type: String }],
});

const User = mongoose.model("User", UserSchema);
export default User;
