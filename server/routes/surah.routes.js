const express = require('express');
const jwt = require('jsonwebtoken');
const Surah = require('../models/Surah');

const router = express.Router();

// Inline middleware for admin protection
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// GET /api/surahs - List all surahs with optional filtering/sorting
router.get('/', async (req, res, next) => {
  try {
    const { revelationPlace, search, sort } = req.query;
    const filter = {};

    if (revelationPlace) {
      filter.revelationPlace = new RegExp(`^${revelationPlace}$`, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { nameArabic: searchRegex },
        { nameTransliteration: searchRegex },
        { nameMeaning: searchRegex }
      ];
      if (!isNaN(search)) {
        filter.$or.push({ number: Number(search) });
      }
    }

    let sortOptions = { number: 1 };
    if (sort === 'revelation') {
      sortOptions = { revelationOrder: 1 };
    } else if (sort === 'ayahs') {
      sortOptions = { ayahCount: -1 };
    } else if (sort === 'name') {
      sortOptions = { nameTransliteration: 1 };
    }

    const surahs = await Surah.find(filter).sort(sortOptions);
    res.json(surahs);
  } catch (err) {
    next(err);
  }
});

// GET /api/surahs/:id - Get a single surah by MongoDB _id or Surah Number
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let surah;

    if (!isNaN(id)) {
      surah = await Surah.findOne({ number: Number(id) });
    } else {
      surah = await Surah.findById(id);
    }

    if (!surah) {
      return res.status(404).json({ error: 'Surah not found' });
    }

    res.json(surah);
  } catch (err) {
    next(err);
  }
});

// POST /api/surahs - Create a new surah (Public endpoint per auth rules)
router.post('/', async (req, res, next) => {
  try {
    const {
      number,
      nameArabic,
      nameTransliteration,
      nameMeaning,
      revelationPlace,
      revelationOrder,
      ayahCount
    } = req.body;

    if (!number || !nameArabic || !nameTransliteration || !nameMeaning) {
      return res.status(400).json({ error: 'Missing required surah fields' });
    }

    const existingSurah = await Surah.findOne({ number });
    if (existingSurah) {
      return res.status(400).json({ error: `Surah with number ${number} already exists` });
    }

    const newSurah = new Surah({
      number,
      nameArabic,
      nameTransliteration,
      nameMeaning,
      revelationPlace,
      revelationOrder,
      ayahCount
    });

    const savedSurah = await newSurah.save();
    res.status(201).json(savedSurah);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /api/surahs/:id - Update surah (Admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    let updatedSurah;

    if (!isNaN(id)) {
      updatedSurah = await Surah.findOneAndUpdate(
        { number: Number(id) },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      updatedSurah = await Surah.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!updatedSurah) {
      return res.status(404).json({ error: 'Surah not found' });
    }

    res.json(updatedSurah);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /api/surahs/:id - Delete surah (Admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    let deletedSurah;

    if (!isNaN(id)) {
      deletedSurah = await Surah.findOneAndDelete({ number: Number(id) });
    } else {
      deletedSurah = await Surah.findByIdAndDelete(id);
    }

    if (!deletedSurah) {
      return res.status(404).json({ error: 'Surah not found' });
    }

    res.json({ message: 'Surah deleted successfully', surah: deletedSurah });
  } catch (err) {
    next(err);
  }
});

module.exports = router;