const express = require('express');
const Feedbacks = require('../models/Feedbacks');
const jwt = require('jsonwebtoken');
const router = express.Router();

function requireAdmin(req, res, next) {
  const h = req.headers.authorization || ''; const t = h.replace(/^Bearer\s+/i, '').trim();
  if (!t) return res.status(401).json({ error: 'Admin authentication required' });
  try { jwt.verify(t, process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me'); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired admin token' }); }
}

router.get('/', async (req, res) => { try { res.json(await Feedbacks.find().sort('-createdAt')); } catch (e) { res.status(500).json({ error: 'Failed to fetch.' }); } });
router.get('/:id', async (req, res) => { try { const doc = await Feedbacks.findById(req.params.id); if (!doc) return res.status(404).json({ error: 'Not found.' }); res.json(doc); } catch (e) { res.status(404).json({ error: 'Not found.' }); } });
router.post('/', async (req, res) => { try { res.status(201).json(await Feedbacks.create(req.body)); } catch (e) { res.status(400).json({ error: e.message }); } });
router.put('/:id', requireAdmin, async (req, res) => { try { const doc = await Feedbacks.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!doc) return res.status(404).json({ error: 'Not found.' }); res.json(doc); } catch (e) { res.status(400).json({ error: e.message }); } });
router.delete('/:id', requireAdmin, async (req, res) => { try { const doc = await Feedbacks.findByIdAndDelete(req.params.id); if (!doc) return res.status(404).json({ error: 'Not found.' }); res.json({ message: 'Deleted.' }); } catch (e) { res.status(404).json({ error: 'Not found.' }); } });

module.exports = router;
