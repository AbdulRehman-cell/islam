const mongoose = require('mongoose');

const surahSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, 'Surah number is required'],
      unique: true,
      min: 1,
      max: 114,
      index: true
    },
    nameArabic: {
      type: String,
      required: [true, 'Arabic name is required'],
      trim: true
    },
    nameTransliteration: {
      type: String,
      required: [true, 'Transliterated name is required'],
      trim: true
    },
    nameMeaning: {
      type: String,
      required: [true, 'English translation/meaning is required'],
      trim: true
    },
    revelationPlace: {
      type: String,
      enum: ['Meccan', 'Medinan', 'Makkah', 'Madinah'],
      default: 'Meccan',
      trim: true
    },
    revelationOrder: {
      type: Number,
      min: 1,
      max: 114
    },
    ayahCount: {
      type: Number,
      required: [true, 'Ayah count is required'],
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Surah', surahSchema);