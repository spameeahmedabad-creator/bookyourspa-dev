import mongoose from "mongoose";

const PricingItemSchema = new mongoose.Schema({
  image: String,
  title: String,
  description: String,
  price: Number,
  multiplier: String,
  quantity: Number,
});

const SpaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  logo: String,
  services: [
    {
      type: String,
    },
  ],
  location: {
    address: String,
    region: String,
    longitude: Number,
    latitude: Number,
    googleMapsLink: String,
  },
  gallery: [String],
  description: String,
  contact: {
    phone: String,
    email: String,
    website: String,
    facebook: String,
    whatsapp: String,
    instagram: String,
    skype: String,
  },
  storeHours: {
    is24Hours: {
      type: Boolean,
      default: false,
    },
    openingTime: {
      type: String,
      required: true,
      default: "09:00",
    },
    closingTime: {
      type: String,
      required: true,
      default: "21:00",
    },
    sundayClosed: {
      type: Boolean,
      default: false,
    },
  },
  pricing: [PricingItemSchema],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SpaSchema.index({
  title: "text",
  "location.address": "text",
  "location.region": "text",
  services: "text",
});

// Use existing model if available, otherwise create new one
export default mongoose.models.Spa || mongoose.model("Spa", SpaSchema);
