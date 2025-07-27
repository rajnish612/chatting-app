import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  filePath: { type: String, required: true },
  fileUrl: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
});

const Document = mongoose.model("Document", documentSchema);
export default Document;