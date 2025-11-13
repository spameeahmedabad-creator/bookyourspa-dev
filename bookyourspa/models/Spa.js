import mongoose from 'mongoose';

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
  services: [{
    type: String,
  }],
  location: {
    address: String,
    region: String,
    longitude: Number,
    latitude: Number,
  },
  gallery: [String],
  description: String,
  contact: {
    phone: String,
    email: String,
    website: String,
    facebook: String,
    twitter: String,
    instagram: String,
    skype: String,
  },
  pricing: [PricingItemSchema],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SpaSchema.index({ title: 'text', 'location.address': 'text', 'location.region': 'text', services: 'text' });

export default mongoose.models.Spa || mongoose.model('Spa', SpaSchema);
