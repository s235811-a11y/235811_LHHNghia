const mongoose = require('mongoose');

const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];

const deviceSchema = new mongoose.Schema({
  deviceId:     { type: String, required: true, unique: true, trim: true },
  name:         { type: String, required: true, trim: true },
  deviceType:   { type: String, required: true, trim: true },
  room:         { type: String, required: true, trim: true },
  brand:        { type: String, trim: true, default: '' },
  model:        { type: String, trim: true, default: '' },
  quantity:     { type: Number, required: true, min: 0 },
  status:       { type: String, enum: STATUSES, default: 'Đang sử dụng' },
  purchaseDate: { type: Date },
  description:  { type: String, trim: true, default: '' },
}, { collection: 'devices', timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
