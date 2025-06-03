import express from "express";

import User from "../models/User.js";
const router = express.Router();
router.route("/").get(async (req, res) => {
  try {
    console.log(req.session);
    
    const { user } = req.session;

    

    if (user) {
      const users = await User.find({
        username: { $ne: user.username },
      }).select("-password");
      return res.status(200).json({ user: user, users: users, success: true });
    }
    return res.status(401).json({ message: "Unauthorized", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.route("/follow").post(async (req, res) => {
  try {
    const { user } = req.session;
    if (user) {
      const followUsername = req.body.username;
      if (!followUsername) {
        return res.status(400).json({ message: "Username is required" });
      }
      const userToFollow = await User.findOne({ username: followUsername });

      if (!userToFollow) {
        return res.status(400).json({ message: "User not found" });
      }
      user = await User.findOneAndUpdate(
        { username: user.username },
        { $addToSet: { following: userToFollow.username } }
      );
      await User.findOneAndUpdate(
        { username: userToFollow.username },
        { $addToSet: { followers: user.username } }
      );
      return res
        .status(200)
        .json({ message: "User followed successfully", success: true });
    }
    return res.json({ message: "Unauthorized", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
