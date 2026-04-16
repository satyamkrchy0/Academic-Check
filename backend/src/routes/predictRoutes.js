const express = require('express');
const { body } = require('express-validator');

const requireAuth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createPrediction, listPredictions } = require('../services/predictionService');

const router = express.Router();

const predictionValidators = [
  body('academicScore').isFloat({ min: 0, max: 100 }),
  body('skillsRating').isFloat({ min: 0, max: 10 }),
  body('projectsCount').isInt({ min: 0, max: 20 }),
  body('internshipExperience').isInt({ min: 0, max: 5 }),
  body('communicationSkills').isFloat({ min: 0, max: 10 })
];

router.post('/', requireAuth, predictionValidators, validateRequest, async (req, res, next) => {
  try {
    const prediction = await createPrediction(req.user.sub, req.body);

    req.app.get('io')?.to(req.user.sub).emit('prediction:created', prediction);

    return res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    return next(error);
  }
});

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const history = await listPredictions(req.user.sub);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
