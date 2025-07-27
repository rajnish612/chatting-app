import mongoose from "mongoose";

const audioMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  audioData: { type: String, required: true }, // Base64 encoded audio
  duration: { type: Number, required: true }, // Duration in seconds
  fileType: { type: String, default: "audio/webm" },
  fileSize: { type: Number }, // Size in bytes
  timestamp: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
  isPlayed: { type: Boolean, default: false },
});

const AudioMessage = mongoose.model("AudioMessage", audioMessageSchema);
export default AudioMessage;