// server/models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    wa_id: { type: String, index: true }, // phone number ID
    contact_name: String,
    from: String,
    msg_id: { type: String, unique: true },
    meta_msg_id: String,
    text: String,
    timestamp: { type: Date, default: Date.now },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "inbound",
    },
    status: {
      type: String,
      enum: ["received", "sent", "delivered", "read"],
      default: "received",
    },
    raw: Object,
  },
  { timestamps: true, collection: "processed_messages" }
);

export default mongoose.model("Message", MessageSchema);
