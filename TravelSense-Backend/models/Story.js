const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: Date, default: Date.now },
  narrative: { type: String, required: true },
  imageUrl: { type: String },
  questCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);
