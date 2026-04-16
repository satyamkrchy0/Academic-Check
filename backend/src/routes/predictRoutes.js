const express = require('express');
const { body, matchedData } = require('express-validator');

const requireAuth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createPrediction, listPredictions } = require('../services/predictionService');
const { predictLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const predictionValidators = [
  body('academicScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('academicScore must be between 0 and 100')
    .toFloat(),
  body('skillsRating')
    .isFloat({ min: 0, max: 10 })
    .withMessage('skillsRating must be between 0 and 10')
    .toFloat(),
  body('projectsCount')
    .isInt({ min: 0, max: 20 })
    .withMessage('projectsCount must be between 0 and 20')
    .toInt(),
  body('internshipExperience')
    .isInt({ min: 0, max: 5 })
    .withMessage('internshipExperience must be between 0 and 5')
    .toInt(),
  body('communicationSkills')
    .isFloat({ min: 0, max: 10 })
    .withMessage('communicationSkills must be between 0 and 10')
    .toFloat()
];

router.post('/', predictLimiter, requireAuth, predictionValidators, validateRequest, async (req, res, next) => {
  try {
    const payload = matchedData(req, { locations: ['body'] });
    const prediction = await createPrediction(req.user.sub, payload);

    req.app.get('io')?.to(req.user.sub).emit('prediction:created', prediction);

    return res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    return next(error);
  }
});

router.get('/history', predictLimiter, requireAuth, async (req, res, next) => {
  try {
    const history = await listPredictions(req.user.sub);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
