const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  city: { type: String, required: true },
  title: { type: String, required: true },
  riddle: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false },
  points: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quest', questSchema);
