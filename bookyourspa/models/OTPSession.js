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

// Delete model if it exists to avoid OverwriteModelError
if (mongoose.models.OTPSession) {
  delete mongoose.models.OTPSession;
}

export default mongoose.model('OTPSession', OTPSessionSchema);
