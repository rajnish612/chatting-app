import express from "express";

import User from "../models/User.js";
const router = express.Router();
router.route("/").get(async (req, res) => {
  try {
    const { user } = req.session;
    console.log(user);

    if (user) {
      const users = await User.find({
        username: { $ne: user },
      }).select("-password");
      return res
        .status(200)
        .json({
          user: await User.findOne({ username: user }).select("-password"),
          users: users,
          success: true,
        });
    }
    return res.status(401).json({ message: "Unauthorized", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.route("/follow").post(async (req, res) => {
  try {
    console.log(req.body.username);

    const { user } = req.session;
    if (user) {
      let followUsername = req.body.username;
      if (!followUsername) {
        return res.status(400).json({ message: "Username is required" });
      }
      let userToFollow = await User.findOne({ username: followUsername });
      let self = await User.findOne({ username: user });
      if (userToFollow.followers.includes(user)) {
        await User.findOneAndUpdate(
          { username: user },
          { $pull: { followings: userToFollow.username } }
        );
        await User.findOneAndUpdate(
          { username: userToFollow.username },
          { $pull: { followers: user } }
        );
        return res
          .status(400)
          .json({ message: "unfollowed user successfully" });
      }
      console.log(userToFollow);

      if (!userToFollow) {
        return res.status(400).json({ message: "User not found" });
      }
      self = await User.findOneAndUpdate(
        { username: user },
        { $addToSet: { followings: userToFollow.username } }
      );

      await User.findOneAndUpdate(
        { username: userToFollow.username },
        { $addToSet: { followers: user } }
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
