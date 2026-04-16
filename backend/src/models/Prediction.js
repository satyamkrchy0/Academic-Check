const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    input: {
      academicScore: Number,
      skillsRating: Number,
      projectsCount: Number,
      internshipExperience: Number,
      communicationSkills: Number
    },
    output: {
      employmentProbability: Number,
      careerReadinessScore: Number,
      explanation: String
    },
    postgresPredictionId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prediction', predictionSchema);
