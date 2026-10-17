const mongoose = require('mongoose');

const ayahSchema = new mongoose.Schema(
  {
    surahNumber: {
      type: Number,
      required: [true, 'Surah number is required'],
      min: [1, 'Surah number must be between 1 and 114'],
      max: [114, 'Surah number must be between 1 and 114'],
      index: true
    },
    ayahNumber: {
      type: Number,
      required: [true, 'Ayah number is required'],
      min: [1, 'Ayah number must be at least 1']
    },
    textArabic: {
      type: String,
      required: [true, 'Arabic text is required'],
      trim: true
    },
    textTranslation: {
      type: String,
      required: [true, 'Translation text is required'],
      trim: true
    },
    textTransliteration: {
      type: String,
      default: '',
      trim: true
    },
    audioUrl: {
      type: String,
      default: '',
      trim: true
    },
    juz: {
      type: Number,
      min: [1, 'Juz must be between 1 and 30'],
      max: [30, 'Juz must be between 1 and 30'],
      default: 1
    },
    page: {
      type: Number,
      min: [1, 'Page must be at least 1'],
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast lookup of specific ayahs within a surah
ayahSchema.index({ surahNumber: 1, ayahNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ayah', ayahSchema);