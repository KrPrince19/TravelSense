const mongoose = require('mongoose');

const CultureDataSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  famous_foods: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    image_url: String
  }],
  languages: [{
    language: {
      type: String,
      required: true
    },
    phrases: [{
      english: String,
      local: String
    }]
  }],
  culture_tips: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'cultural_insights'
});



// Compile model from schema, preventing overwrite error on hotreloads
module.exports = mongoose.models.CultureData || mongoose.model('CultureData', CultureDataSchema);
