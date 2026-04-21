const Prediction = require('../models/Prediction');
const { prisma } = require('../config/db');
const { requestPrediction, requestLLMExplanation } = require('./mlClient');

async function createPrediction(userId, payload) {
  const prediction = await requestPrediction(payload);

  const explanation =
    (await requestLLMExplanation({ input: payload, output: prediction })) ||
    prediction.explanation ||
    'Improve practical projects and communication for higher employability.';

  const postgresRecord = await prisma.predictionRecord.create({
    data: {
      userMongoId: userId,
      academicScore: payload.academicScore,
      skillsRating: payload.skillsRating,
      projectsCount: payload.projectsCount,
      internshipExperience: payload.internshipExperience,
      communicationSkills: payload.communicationSkills,
      employmentProbability: prediction.employment_probability,
      careerReadinessScore: prediction.career_readiness_score,
      explanation
    }
  });

  const mongoRecord = await Prediction.create({
    userId,
    input: payload,
    output: {
      employmentProbability: prediction.employment_probability,
      careerReadinessScore: prediction.career_readiness_score,
      explanation
    },
    postgresPredictionId: postgresRecord.id
  });

  return {
    id: mongoRecord._id,
    employmentProbability: prediction.employment_probability,
    careerReadinessScore: prediction.career_readiness_score,
    explanation
  };
}

async function listPredictions(userId) {
  return Prediction.find({ userId }).sort({ createdAt: -1 }).lean();
}

module.exports = {
  createPrediction,
  listPredictions
};
