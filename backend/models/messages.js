import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
  deletedFor: { type: [String], default: [] },
  deletedForEveryone: { type: Boolean, default: false },
  messageType: { type: String, default: null },
  audioId: { type: String },
});
const Message = mongoose.model("Message", messageSchema);
export default Message;
