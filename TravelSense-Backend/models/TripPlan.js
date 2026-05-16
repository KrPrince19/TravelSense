const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  planJSON: {
    type: Object,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('TripPlan', tripPlanSchema);
