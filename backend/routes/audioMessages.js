import express from "express";
import fs from "fs";
import { uploadAudio } from "../lib/VoiceUploader.js";
const router = express.Router();

router.route("/").post(async (req, res) => {
  try {
    const { audio } = req.files;
    const { sender, receiver, duration, type } = req.body;
    
    // Read buffer from temp file
    const audioBuffer = fs.readFileSync(audio.tempFilePath);
    
    const { public_id, url } = await uploadAudio(audioBuffer);
    console.log("Upload success:", { url, public_id });
    
    res.json({
      success: true,
      audio: { public_id, url },
      sender,
      receiver,
      duration,
      type
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
