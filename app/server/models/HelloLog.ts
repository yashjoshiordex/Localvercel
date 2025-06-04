// app/models/HelloLog.ts
import mongoose from "mongoose";

const helloLogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const HelloLog = mongoose.models.HelloLog || mongoose.model("HelloLog", helloLogSchema);
