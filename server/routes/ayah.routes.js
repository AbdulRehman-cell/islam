const express = require('express');
const jwt = require('jsonwebtoken');
const Ayah = require('../models/Ayah');

const router = express.Router();

// Middleware to verify admin JWT token
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// GET /api/ayahs/daily - deterministic daily ayah (changes each calendar day)
router.get('/daily', async (req, res, next) => {
  try {
    const count = await Ayah.countDocuments();
    if (count === 0) return res.status(404).json({ error: 'No ayahs in database yet' });
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const ayah = await Ayah.findOne().skip(dayOfYear % count);
    res.json(ayah);
  } catch (error) { next(error); }
});

// GET /api/ayahs/surah/:surahNumber - all ayahs for a given surah number
router.get('/surah/:surahNumber', async (req, res, next) => {
  try {
    const surahNumber = Number(req.params.surahNumber);
    if (isNaN(surahNumber)) return res.status(400).json({ error: 'Invalid surah number' });
    const ayahs = await Ayah.find({ surahNumber }).sort({ ayahNumber: 1 });
    res.json(ayahs);
  } catch (error) { next(error); }
});

// GET /api/ayahs - Fetch all ayahs (with optional query parameters like surahNumber, juz, page)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.surahNumber) {
      filter.surahNumber = Number(req.query.surahNumber);
    }
    if (req.query.juz) {
      filter.juz = Number(req.query.juz);
    }
    if (req.query.page) {
      filter.page = Number(req.query.page);
    }

    const ayahs = await Ayah.find(filter).sort({ surahNumber: 1, ayahNumber: 1 });
    res.json(ayahs);
  } catch (error) {
    next(error);
  }
});

// GET /api/ayahs/:id - Fetch single ayah by ID or by surah:ayah query format
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let ayah;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      ayah = await Ayah.findById(id);
    } else if (id.includes(':')) {
      const [surahNum, ayahNum] = id.split(':').map(Number);
      if (!isNaN(surahNum) && !isNaN(ayahNum)) {
        ayah = await Ayah.findOne({ surahNumber: surahNum, ayahNumber: ayahNum });
      }
    }

    if (!ayah) {
      return res.status(404).json({ error: 'Ayah not found' });
    }

    res.json(ayah);
  } catch (error) {
    next(error);
  }
});

// POST /api/ayahs - Create a new ayah (Public)
router.post('/', async (req, res, next) => {
  try {
    const {
      surahNumber,
      ayahNumber,
      textArabic,
      textTranslation,
      textTransliteration,
      audioUrl,
      juz,
      page
    } = req.body;

    if (surahNumber === undefined || ayahNumber === undefined || !textArabic) {
      return res.status(400).json({ error: 'surahNumber, ayahNumber, and textArabic are required' });
    }

    const newAyah = new Ayah({
      surahNumber: Number(surahNumber),
      ayahNumber: Number(ayahNumber),
      textArabic,
      textTranslation: textTranslation || '',
      textTransliteration: textTransliteration || '',
      audioUrl: audioUrl || '',
      juz: juz ? Number(juz) : undefined,
      page: page ? Number(page) : undefined
    });

    const savedAyah = await newAyah.save();
    res.status(201).json(savedAyah);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// PUT /api/ayahs/:id - Update an ayah (requireAdmin)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updatedAyah = await Ayah.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAyah) {
      return res.status(404).json({ error: 'Ayah not found' });
    }

    res.json(updatedAyah);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/ayahs/:id - Delete an ayah (requireAdmin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deletedAyah = await Ayah.findByIdAndDelete(id);

    if (!deletedAyah) {
      return res.status(404).json({ error: 'Ayah not found' });
    }

    res.json({ message: 'Ayah deleted successfully', id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;