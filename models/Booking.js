import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  spaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Spa",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    default: null,
  },
  service: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "confirmed",
  },
  // Pricing snapshot - stored at time of booking
  couponCode: {
    type: String,
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  originalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  finalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Snapshot data - preserved at time of booking even if spa details change later
  snapshot: {
    spaName: {
      type: String,
      default: null,
    },
    spaLocation: {
      address: String,
      region: String,
    },
    spaPhone: {
      type: String,
      default: null,
    },
    serviceDetails: {
      title: String,
      description: String,
      price: Number,
      duration: String, // e.g., "60 mins"
    },
    couponDetails: {
      code: String,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      discountValue: Number,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Use existing model if available, otherwise create new one
export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
