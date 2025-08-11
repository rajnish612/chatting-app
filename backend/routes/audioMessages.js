import express from "express";
import fs from "fs";
import { uploadAudio } from "../lib/VoiceUploader.js";
import User from "../models/User.js";
import Message from "../models/messages.js";
const router = express.Router();

router.route("/").post(async (req, res) => {
  try {
    const { audio } = req.files;
    const { sender, receiver, duration, type } = req.body;

    // Read buffer from temp file
    const audioBuffer = fs.readFileSync(audio.tempFilePath);

    const { public_id, url } = await uploadAudio(audioBuffer);
    const audioMessage = await Message.create({
      audio: { public_id, url },
      sender: sender,
      receiver: receiver,
      content: url,
      duration: duration,
      type: type,
    });

    res.json({
      success: true,
      ...audioMessage,
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
