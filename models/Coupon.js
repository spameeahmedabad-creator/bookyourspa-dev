import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["percent", "fixed"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  scope: {
    type: String,
    enum: ["global", "spa"],
    required: true,
    default: "spa",
  },
  spaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Spa",
    required: function () {
      return this.scope === "spa";
    },
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1, // How many times a single user can use this coupon
    min: 1,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Promotional Banner Settings
  showBanner: {
    type: Boolean,
    default: false,
  },
  bannerText: {
    type: String,
    default: "",
  },
  bannerColor: {
    type: String,
    enum: ["emerald", "red", "purple", "orange", "blue", "pink"],
    default: "emerald",
  },
  bannerPosition: {
    type: String,
    enum: ["top", "floating"],
    default: "top",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for unique code per scope/spa
CouponSchema.index({ code: 1, scope: 1, spaId: 1 }, { unique: true });

// Index for efficient queries
CouponSchema.index({ spaId: 1, isActive: 1 });
CouponSchema.index({ scope: 1, isActive: 1 });
CouponSchema.index({ code: 1 });

// Virtual to check if coupon is valid (within date range and usage limits)
CouponSchema.virtual("isValid").get(function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startDate || now > this.endDate) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit)
    return false;
  return true;
});

// Method to check if coupon can be used
CouponSchema.methods.canBeUsed = function (userId, orderAmount = 0) {
  if (!this.isValid)
    return { valid: false, reason: "Coupon is not active or expired" };
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${this.minOrderAmount} required`,
    };
  }
  return { valid: true };
};

// Method to calculate discount
CouponSchema.methods.calculateDiscount = function (orderAmount) {
  if (this.type === "percent") {
    const discount = (orderAmount * this.value) / 100;
    return Math.min(discount, orderAmount); // Don't exceed order amount
  } else {
    // Fixed discount
    return Math.min(this.value, orderAmount); // Don't exceed order amount
  }
};

// Use existing model if available, otherwise create new one
export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
