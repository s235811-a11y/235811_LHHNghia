const express = require('express');
const mongoose = require('mongoose');
const Device = require('../models/Device');
const router = express.Router();

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function handleError(err, res) {
  if (err.code === 11000) return res.status(409).json({ message: 'Mã thiết bị (deviceId) đã tồn tại' });
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', details });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Dữ liệu hoặc ID không hợp lệ' });
  console.error(err);
  return res.status(500).json({ message: 'Lỗi máy chủ hoặc lỗi kết nối cơ sở dữ liệu' });
}

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'ID không hợp lệ' });

// GET /api/devices?search=...
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter = { $or: [{ deviceId: rx }, { name: rx }, { deviceType: rx }, { room: rx }] };
    }
    const devices = await Device.find(filter).sort({ createdAt: -1 });
    res.json(devices);
  } catch (err) { handleError(err, res); }
});

router.get('/:id', validId, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) { handleError(err, res); }
});

router.post('/', async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (err) { handleError(err, res); }
});

router.put('/:id', validId, async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) { handleError(err, res); }
});

router.delete('/:id', validId, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Đã xóa thiết bị' });
  } catch (err) { handleError(err, res); }
});

module.exports = router;
