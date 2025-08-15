import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String },
  timestamp: { type: Date, default: Date.now },
  isSeen: { type: Boolean, default: false },
  deletedFor: { type: [String], default: [] },
  deletedForEveryone: { type: Boolean, default: false },
  type: { type: String, default: null },
  audio: {
    public_id: { type: String },
    url: { type: String },
  },
  image: {
    public_id: { type: String },
    url: { type: String },
  },
  duration: { type: String },
});
const Message = mongoose.model("Message", messageSchema);
export default Message;
