import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    notificationStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    // Short error code only (e.g. "EAUTH"), never credentials or full error text.
    notificationError: { type: String, maxlength: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
