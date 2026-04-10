require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gritek_solution';

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://gritek-solutions.vercel.app',
  'https://gritek-frontend.vercel.app',
  'https://gritek-frontend-gritek.vercel.app',
  'https://gritek-frontend-git-main-gritek.vercel.app',
  'https://gritek-solutions.onrender.com',
  'https://www.griteksolutions.com',
  'https://griteksolutions.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
if (!MONGO_URI) {
  console.error('\x1b[31mCRITICAL: MONGO_URI is not defined in environment variables\x1b[0m');
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('\x1b[32mSuccessfully connected to MongoDB Atlas\x1b[0m'))
  .catch((err) => {
    console.error('\x1b[31mCRITICAL: MongoDB connection error:\x1b[0m', err.message);
    if (err.message.includes('MongooseServerSelectionError')) {
      console.warn('\x1b[33mTip: Check if your IP is whitelisted in Atlas (0.0.0.0/0 recommended for Render).\x1b[0m');
    }
  });

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Routes
app.use('/api', apiRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Gritek Solutions Backend API!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
