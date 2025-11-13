import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['customer', 'spa_owner', 'admin'],
    default: 'customer',
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spa',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Delete model if it exists to avoid OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
