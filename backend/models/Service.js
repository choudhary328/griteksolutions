const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // Store lucide-react icon name as a string, e.g., 'Code2'
  accent: { type: String, required: true },
  features: [{ type: String }],
  process: [{ type: String }],
  technologies: [{ type: String }],
  pricing: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Service', serviceSchema);
