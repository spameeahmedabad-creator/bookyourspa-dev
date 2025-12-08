import mongoose from 'mongoose';

const OTPSessionSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired OTP sessions
OTPSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Use existing model if available, otherwise create new one
export default mongoose.models.OTPSession || mongoose.model('OTPSession', OTPSessionSchema);
