const mongoose = require('mongoose');

const AppSchema = new mongoose.Schema({
  app_name: {
    type: String,
    required: true,
  },
  app_integration: {
    type: String,
    default: 'SWA',
  },
  big_bang: {
    type: Boolean,
    default: false,
  },
  big_bang_notes: {
    type: String,
  },
  supported_features: {
    type: [String],
  },
  important_warning: {
    type: String,
  },
  okta_app_url: {
    type: String,
  },
  last_edited: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
});
