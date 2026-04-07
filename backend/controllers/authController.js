const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';

// Register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await Staff.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Staff({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Failed to register', details: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Staff.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    console.log('Login attempt for:', username);
    console.log('Password type:', typeof password);
    console.log('Comparing password:', password);
    console.log('With hash:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Match result:', isMatch);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { username: user.username } });
  } catch (err) {
    console.error('Login Error details:', {
      message: err.message,
      stack: err.stack,
      username: req.body?.username
    });
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
};

// Verify token
exports.verify = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: { id: decoded.id, username: decoded.username } });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
};

// Protect
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized' });
  }
};

// Setup Admin
exports.setupAdmin = async (req, res) => {
  try {
    const { key } = req.body;
    // Simple basic protection key to prevent random users from resetting the password.
    if (key !== 'setup2026') return res.status(403).json({ error: 'Forbidden' });

    let admin = await Staff.findOne({ username: 'gritek@admin.com' });
    const hashedPassword = await bcrypt.hash('gritek@2028', 10);
    
    if (!admin) {
      admin = new Staff({
        username: 'gritek@admin.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      res.json({ message: 'Admin user created successfully' });
    } else {
      admin.password = hashedPassword;
      await admin.save();
      res.json({ message: 'Admin user password reset successfully' });
    }
  } catch (err) {
    console.error('Setup Admin Error details:', err);
    res.status(500).json({ error: 'Failed to setup admin', details: err.message });
  }
};
