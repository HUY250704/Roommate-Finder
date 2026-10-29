const User = require('../models/User');
const connectDB = require('../config/db');
const request = require('supertest');
const app = require('../index');

describe('administrator bootstrap', () => {
  const originalPassword = process.env.ADMIN_SEED_PASSWORD;
  const originalResetFlag = process.env.ADMIN_SEED_RESET_EXISTING;

  beforeEach(() => {
    process.env.ADMIN_SEED_PASSWORD = 'new-admin-password-2026';
    delete process.env.ADMIN_SEED_RESET_EXISTING;
  });

  afterEach(() => {
    if (originalPassword === undefined) delete process.env.ADMIN_SEED_PASSWORD;
    else process.env.ADMIN_SEED_PASSWORD = originalPassword;

    if (originalResetFlag === undefined) delete process.env.ADMIN_SEED_RESET_EXISTING;
    else process.env.ADMIN_SEED_RESET_EXISTING = originalResetFlag;
  });

  it('creates the configured admin account when it does not exist', async () => {
    await connectDB.seedDefaultAccounts();

    const admin = await User.findOne({ email: 'admin@roommate.com' });
    expect(admin.role).toBe('admin');
    expect(admin.isVerified).toBe(true);
    expect(await admin.matchPassword('new-admin-password-2026')).toBe(true);

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@roommate.com',
      password: 'new-admin-password-2026',
    });
    expect(response.status).toBe(200);
    expect(response.body.role).toBe('admin');
  });

  it('does not change an existing account unless the reset flag is enabled', async () => {
    const existing = await User.create({
      username: 'existing-admin',
      email: 'admin@roommate.com',
      password: 'old-admin-password',
      role: 'user',
      isVerified: false,
    });

    await connectDB.seedDefaultAccounts();

    const unchanged = await User.findById(existing._id);
    expect(unchanged.role).toBe('user');
    expect(unchanged.isVerified).toBe(false);
    expect(await unchanged.matchPassword('old-admin-password')).toBe(true);
  });

  it('resets and promotes the existing account only when explicitly enabled', async () => {
    const existing = await User.create({
      username: 'existing-admin',
      email: 'admin@roommate.com',
      password: 'old-admin-password',
      role: 'user',
      isVerified: false,
    });
    process.env.ADMIN_SEED_RESET_EXISTING = 'true';

    await connectDB.seedDefaultAccounts();

    const resetAdmin = await User.findById(existing._id);
    expect(resetAdmin.role).toBe('admin');
    expect(resetAdmin.isVerified).toBe(true);
    expect(await resetAdmin.matchPassword('new-admin-password-2026')).toBe(true);
    expect(await resetAdmin.matchPassword('old-admin-password')).toBe(false);
  });
});
