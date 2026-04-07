const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Customer' },
  company: { type: String, default: '' },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);
