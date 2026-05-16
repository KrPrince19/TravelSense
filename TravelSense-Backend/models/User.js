const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  lastLocation: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
