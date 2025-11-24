import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: function () {
      // Email is required if no phone (for new users)
      // For backward compatibility, allow users with only phone
      return !this.phone;
    },
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      // Password required if no googleId (for email/password users)
      return !this.googleId;
    },
    select: false, // Don't return password by default
  },
  phone: {
    type: String,
    required: function () {
      // Phone is required if no email (for backward compatibility)
      return !this.email;
    },
    unique: true,
    sparse: true, // Allow multiple null values
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["customer", "spa_owner", "admin"],
    default: "customer",
  },
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spa",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Note: Indexes are automatically created by unique: true on email, phone, and googleId fields
// No need for explicit index definitions

// Delete model if it exists to avoid OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", UserSchema);
