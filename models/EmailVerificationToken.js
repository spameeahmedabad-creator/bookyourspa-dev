import mongoose from "mongoose";
import crypto from "crypto";

const EmailVerificationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired tokens
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate verification token
EmailVerificationTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

// Delete model if it exists to avoid OverwriteModelError
if (mongoose.models.EmailVerificationToken) {
  delete mongoose.models.EmailVerificationToken;
}

export default mongoose.model(
  "EmailVerificationToken",
  EmailVerificationTokenSchema
);
