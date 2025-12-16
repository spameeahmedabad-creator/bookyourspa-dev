import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  // Reference to booking
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  // Reference to user (if logged in)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // Razorpay identifiers
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
    index: true,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  // Amount details
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "INR",
  },
  // GST breakdown (18% GST on services)
  gstAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  baseAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Payment status
  status: {
    type: String,
    enum: ["created", "authorized", "captured", "failed", "refunded"],
    default: "created",
  },
  // Payment method used
  method: {
    type: String, // upi, card, netbanking, wallet
    default: null,
  },
  // Additional payment details
  bank: {
    type: String,
    default: null,
  },
  wallet: {
    type: String,
    default: null,
  },
  vpa: {
    type: String, // UPI VPA
    default: null,
  },
  // Card details (masked)
  cardDetails: {
    last4: String,
    network: String, // visa, mastercard, rupay
    type: String, // credit, debit
    issuer: String,
  },
  // Error details (if payment failed)
  errorCode: {
    type: String,
    default: null,
  },
  errorDescription: {
    type: String,
    default: null,
  },
  // Refund details
  refundId: {
    type: String,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  // Customer details (for guest checkout)
  customerDetails: {
    name: String,
    email: String,
    phone: String,
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Timestamps
  paidAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
PaymentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1 });

// Use existing model if available, otherwise create new one
export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);

