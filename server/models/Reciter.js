const mongoose = require('mongoose');

const reciterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reciter name is required'],
      trim: true
    },
    style: {
      type: String,
      default: 'Murattal',
      trim: true
    },
    audioBaseUrl: {
      type: String,
      required: [true, 'Audio base URL is required'],
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reciter', reciterSchema);