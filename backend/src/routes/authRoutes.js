const express = require('express');
const bcrypt = require('bcryptjs');
const { body, matchedData } = require('express-validator');

const User = require('../models/User');
const validateRequest = require('../middleware/validateRequest');
const { signToken } = require('../utils/jwt');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { name, email, password } = matchedData(req);
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash });
      const token = signToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { email, password } = matchedData(req);
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = signToken(user);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
