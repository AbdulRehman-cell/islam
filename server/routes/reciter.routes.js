const express = require('express');
const jwt = require('jsonwebtoken');
const Reciter = require('../models/Reciter');

const router = express.Router();

// Inline Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No admin token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired admin token.' });
  }
};

// GET /api/reciters - List all reciters
router.get('/', async (req, res, next) => {
  try {
    const reciters = await Reciter.find().sort({ isDefault: -1, name: 1 });
    res.json(reciters);
  } catch (error) {
    next(error);
  }
});

// GET /api/reciters/:id - Get single reciter by ID
router.get('/:id', async (req, res, next) => {
  try {
    const reciter = await Reciter.findById(req.params.id);
    if (!reciter) {
      return res.status(404).json({ error: 'Reciter not found' });
    }
    res.json(reciter);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Reciter ID format' });
    }
    next(error);
  }
});

// POST /api/reciters - Create a new reciter (PUBLIC)
router.post('/', async (req, res, next) => {
  try {
    const { name, style, audioBaseUrl, isDefault } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Reciter name is required' });
    }

    // If setting this reciter as default, un-default other reciters
    if (isDefault) {
      await Reciter.updateMany({}, { isDefault: false });
    }

    const reciter = new Reciter({
      name: name.trim(),
      style: style ? style.trim() : '',
      audioBaseUrl: audioBaseUrl ? audioBaseUrl.trim() : '',
      isDefault: Boolean(isDefault)
    });

    const savedReciter = await reciter.save();
    res.status(201).json(savedReciter);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// PUT /api/reciters/:id - Update reciter (requireAdmin)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, style, audioBaseUrl, isDefault } = req.body;

    if (isDefault) {
      await Reciter.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (style !== undefined) updateData.style = style.trim();
    if (audioBaseUrl !== undefined) updateData.audioBaseUrl = audioBaseUrl.trim();
    if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);

    const updatedReciter = await Reciter.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedReciter) {
      return res.status(404).json({ error: 'Reciter not found' });
    }

    res.json(updatedReciter);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Reciter ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/reciters/:id - Delete reciter (requireAdmin)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const deletedReciter = await Reciter.findByIdAndDelete(req.params.id);
    if (!deletedReciter) {
      return res.status(404).json({ error: 'Reciter not found' });
    }

    res.json({ message: 'Reciter successfully deleted', id: req.params.id });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Reciter ID format' });
    }
    next(error);
  }
});

module.exports = router;