import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    shop: { type: String, required: true },
    state: { type: String, default: "" },
    isOnline: { type: Boolean, required: true },
    scope: { type: String, required: true },
    expires: { type: Date, default: null },
    accessToken: { type: String, required: true },
    onlineAccessInfo: { type: mongoose.Schema.Types.Mixed, default: null },

    onboardingCompleted: { type: Boolean, default: false },

    /* ✨ NEW FIELDS ✨ */
    isUninstall: { type: Boolean, default: false },
    uninstallTime: { type: Date, default: null },
  },
  { timestamps: true }
);

export const SessionModel =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
