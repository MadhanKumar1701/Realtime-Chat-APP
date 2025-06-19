const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExist = await User.findOne({ username });
    if (userExist) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ msg: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '2d'
    });

    res.json({ token, username: user.username });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
