import express from "express";
import { upload } from "../lib/Uploader.js";
import User from "../models/User.js";

const router = express.Router();

router.route("/").post(async (req, res) => {
  try {
    if (!req.files || !req.files.avatar || !req.body.email) {
      return res.status(400).send("No file uploaded.");
    }
    const { avatar } = req.files;
    if (!avatar)
      return res
        .status(400)
        .json({ message: "Unable to upload", success: false });
    const { public_id, url } = await upload(avatar);
    if (!public_id || !url)
      return res
        .status(400)
        .json({ message: "unable to upload", success: false });
    const updateUserPhoto = await User.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $set: {
          profilePic: {
            public_id: public_id,
            url: url,
          },
        },
      },
      { new: true }
    ).select("-password");
    return res.status(200).json({ user: updateUserPhoto, success: true });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "unable to upload", success: false });
  }
});
export default router;
