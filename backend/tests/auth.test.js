jest.mock('../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendEmailVerificationCode: jest.fn().mockResolvedValue(undefined),
  sendViewingConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');
const RefreshToken = require('../models/RefreshToken');
const { createUser, tokenFor, cookieFrom } = require('./helpers');

describe('protect middleware', () => {
  it('rejects requests without an access token', async () => {
    const response = await request(app).get('/api/favorites');
    expect(response.status).toBe(401);
  });

  it('rejects an access token with a revoked token version', async () => {
    const user = await createUser({ tokenVersion: 2 });
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenFor(user, 1)}`);

    expect(response.status).toBe(401);
  });

  it.each([
    [{ status: 'banned' }, 'banned'],
    [{ status: 'suspended' }, 'suspended'],
    [{ isBanned: true }, 'legacy banned flag'],
  ])('forbids a %s account', async (changes) => {
    const user = await createUser(changes);
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    expect(response.status).toBe(403);
  });

  it('forbids an account that has not verified its email', async () => {
    const user = await createUser({ isVerified: false });
    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    expect(response.status).toBe(403);
  });
});

describe('authentication flows', () => {
  it('registers a user and sends a verification email', async () => {
    const { sendEmailVerificationCode } = require('../services/emailService');
    const response = await request(app).post('/api/auth/register').send({
      username: 'new-user',
      email: 'new-user@example.com',
      password: 'correct-password',
    });

    expect(response.status).toBe(201);
    expect(response.body.isVerified).toBe(false);
    expect(sendEmailVerificationCode).toHaveBeenCalledWith(
      'new-user@example.com',
      expect.any(String)
    );
  });

  it('logs in a verified user and issues access and refresh tokens', async () => {
    const user = await createUser({ email: 'login@example.com', password: 'correct-password' });
    const response = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'correct-password',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(cookieFrom(response)).toMatch(/^refreshToken=/);
    expect(jwt.verify(response.body.token, process.env.JWT_SECRET).id).toBe(user.id);
  });

  it('rejects a login with the wrong password', async () => {
    const user = await createUser({ email: 'wrong-password@example.com' });
    const response = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
  });

  it('refreshes access credentials and rotates the refresh cookie', async () => {
    const user = await createUser({ email: 'refresh@example.com' });
    const login = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'correct-password',
    });
    const oldCookie = cookieFrom(login);
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const response = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);

    expect(response.status).toBe(200);
    expect(response.body.token).not.toBe(login.body.token);
    expect(cookieFrom(response)).toBeTruthy();
    expect(cookieFrom(response)).not.toBe(oldCookie);
    expect(await RefreshToken.countDocuments({ user: user._id })).toBe(1);
  });

  it('revokes the old refresh and access tokens on logout', async () => {
    const user = await createUser({ email: 'logout@example.com' });
    const login = await request(app).post('/api/auth/login').send({
      email: user.email,
      password: 'correct-password',
    });
    const oldCookie = cookieFrom(login);

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', oldCookie)
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(logout.status).toBe(200);

    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
    const protectedRequest = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${login.body.token}`);
    const updatedUser = await require('../models/User').findById(user._id);

    expect(refresh.status).toBe(401);
    expect(protectedRequest.status).toBe(401);
    expect(updatedUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it('forbids a banned user from refreshing a token', async () => {
    const user = await createUser({ status: 'banned' });
    const rawToken = 'test-refresh-token';
    const crypto = require('crypto');
    await RefreshToken.create({
      user: user._id,
      tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${rawToken}`);

    expect(response.status).toBe(403);
  });
});

describe('authentication rate limits', () => {
  it.each([
    ['/api/auth/login', 10, { email: '', password: '' }],
    ['/api/auth/verify-email', 5, { email: '', code: '' }],
    ['/api/auth/forgot-password', 5, { email: '' }],
  ])('returns 429 after the configured limit for %s', async (path, limit, body) => {
    const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    let response;
    for (let attempt = 0; attempt <= limit; attempt += 1) {
      response = await request(app).post(path).set('X-Forwarded-For', ip).send(body);
    }

    expect(response.status).toBe(429);
  });
});
