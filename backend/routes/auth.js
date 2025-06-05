import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.route("/register").post(async (req, res) => {
  try {
    const { email, password, username } = await req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with the same email" });
    }
    if (!user) {
      user = await User.findOne({ username });
    }
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with the same username" });
    }
    user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      username,
    });

    res.status(201).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
});

router.route("/login").post(async (req, res) => {
  try {
    const { email, password, username } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username });
    }
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = user.username;

      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
