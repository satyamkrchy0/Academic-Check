const express = require('express');
const { body, matchedData } = require('express-validator');

const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { userLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const profileValidators = [
  body('phone').optional({ values: 'falsy' }).isLength({ max: 20 }).withMessage('phone too long').trim(),
  body('university').optional({ values: 'falsy' }).isLength({ max: 120 }).withMessage('university too long').trim(),
  body('degree').optional({ values: 'falsy' }).isLength({ max: 80 }).withMessage('degree too long').trim(),
  body('graduationYear')
    .optional({ values: 'null' })
    .isInt({ min: 2000, max: 2100 })
    .withMessage('graduationYear must be between 2000 and 2100')
    .toInt(),
  body('githubUrl').optional({ values: 'falsy' }).isURL().withMessage('githubUrl must be a valid URL').trim(),
  body('linkedinUrl').optional({ values: 'falsy' }).isURL().withMessage('linkedinUrl must be a valid URL').trim(),
  body('about').optional({ values: 'falsy' }).isLength({ max: 500 }).withMessage('about too long').trim()
];

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profile: user.profile || {}
  };
}

router.get('/me', userLimiter, requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.put('/me', userLimiter, requireAuth, profileValidators, validateRequest, async (req, res, next) => {
  try {
    const profile = matchedData(req, { locations: ['body'] });
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: { profile } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
