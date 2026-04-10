const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const apiController = require('../controllers/apiController');
const authController = require('../controllers/authController');

// Register models
require('../models/Staff');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/verify', authController.verify);
router.post('/auth/setup-admin', authController.setupAdmin);

// Improved Health status
router.get('/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API is running normally',
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState
    },
    env: {
      mongoUriSet: !!process.env.MONGO_URI,
      jwtSecretSet: !!process.env.JWT_SECRET
    },
    timestamp: new Date().toISOString()
  });
});

// Contact routes
router.post('/contact', apiController.submitContactForm);
router.get('/contacts', authController.protect, apiController.getContacts);
router.delete('/contacts/:id', authController.protect, apiController.deleteContact);
router.patch('/contacts/:id/read', authController.protect, apiController.markContactAsRead);

// Project routes
router.get('/projects', apiController.getProjects);
router.post('/projects', authController.protect, upload.single('image'), apiController.createProject);
router.put('/projects/:id', authController.protect, upload.single('image'), apiController.updateProject);
router.delete('/projects/:id', authController.protect, apiController.deleteProject);

// Service routes
router.get('/services', apiController.getServices);
router.post('/services', authController.protect, upload.single('image'), apiController.createService);
router.put('/services/:id', authController.protect, upload.single('image'), apiController.updateService);
router.delete('/services/:id', authController.protect, apiController.deleteService);

// Review routes
router.get('/reviews', authController.protect, apiController.getReviews); // for Admin
router.get('/reviews/approved', apiController.getApprovedReviews); // for Public
router.post('/reviews', apiController.createReview); // for Public
router.patch('/reviews/:id', authController.protect, apiController.updateReviewStatus); // approve/reject
router.delete('/reviews/:id', authController.protect, apiController.deleteReview);

// Settings routes
router.get('/settings', apiController.getSettings);
router.put('/settings', authController.protect, apiController.updateSettings);

// Admin Profile & Staff
router.put('/admin/profile', authController.protect, apiController.updateAdminProfile);
router.get('/admin/staff', authController.protect, apiController.getStaff);
router.post('/admin/staff', authController.protect, apiController.createStaff);
router.delete('/admin/staff/:id', authController.protect, apiController.deleteStaff);

// Newsletter routes
router.post('/newsletter/subscribe', apiController.subscribe);
router.get('/newsletter/subscribers', authController.protect, apiController.getSubscribers);
router.delete('/newsletter/subscribers/:id', authController.protect, apiController.deleteSubscriber);

// Dashboard stats (consolidated endpoint)
router.get('/admin/dashboard', authController.protect, apiController.getDashboardStats);

// Upload generic image
router.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'No image provided' });
  }
});

module.exports = router;
