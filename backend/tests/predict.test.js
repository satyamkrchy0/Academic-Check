const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/predictionService', () => ({
  createPrediction: jest.fn(async () => ({
    id: 'mongo-id',
    employmentProbability: 87,
    careerReadinessScore: 84,
    explanation: 'Great potential'
  })),
  listPredictions: jest.fn(async () => [])
}));

const app = require('../src/app');

describe('POST /api/v1/predict', () => {
  it('returns 401 without token', async () => {
    const response = await request(app).post('/api/v1/predict').send({});
    expect(response.statusCode).toBe(401);
  });

  it('returns 201 for valid payload and token', async () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@example.com' }, 'test-secret');
    process.env.JWT_SECRET = 'test-secret';

    const payload = {
      academicScore: 85,
      skillsRating: 8,
      projectsCount: 4,
      internshipExperience: 1,
      communicationSkills: 8
    };

    const response = await request(app)
      .post('/api/v1/predict')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.employmentProbability).toBe(87);
  });
});
