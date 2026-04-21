const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const User = require('../src/models/User');
const app = require('../src/app');

describe('GET/PUT /api/v1/users/me', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  it('returns 401 without token', async () => {
    const response = await request(app).get('/api/v1/users/me');
    expect(response.statusCode).toBe(401);
  });

  it('returns current user profile', async () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@example.com' }, 'test-secret');
    User.findById.mockResolvedValue({
      _id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      profile: { university: 'ABC University' }
    });

    const response = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.profile.university).toBe('ABC University');
  });

  it('validates profile payload on update', async () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@example.com' }, 'test-secret');

    const response = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ graduationYear: 1999 });

    expect(response.statusCode).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it('updates profile with valid payload', async () => {
    const token = jwt.sign({ sub: 'u1', email: 'test@example.com' }, 'test-secret');
    User.findByIdAndUpdate.mockResolvedValue({
      _id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      profile: { degree: 'B.Tech', graduationYear: 2027 }
    });

    const response = await request(app)
      .put('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ degree: 'B.Tech', graduationYear: 2027 });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.profile.degree).toBe('B.Tech');
    expect(response.body.data.profile.graduationYear).toBe(2027);
  });
});
