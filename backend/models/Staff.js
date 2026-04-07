const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.models.GritekStaff || mongoose.model('GritekStaff', staffSchema);
