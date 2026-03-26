const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true // 'stripe', 'paypal', 'klarna', 'ga4', 'fbpixel', etc.
  },
  name: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Stores whatever JSON data is needed for that integration
    default: {}
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
