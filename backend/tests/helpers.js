const User = require('../models/User');
const generateToken = require('../utils/tokenGenerator');

const createUser = async (overrides = {}) => {
  const number = Math.random().toString(36).slice(2, 10);
  return User.create({
    username: `user-${number}`,
    email: `user-${number}@example.com`,
    password: 'correct-password',
    isVerified: true,
    ...overrides,
  });
};

const tokenFor = (user, tokenVersion = user.tokenVersion) =>
  generateToken(user._id, tokenVersion);

const cookieFrom = (response) =>
  response.headers['set-cookie']?.find((cookie) => cookie.startsWith('refreshToken='))?.split(';')[0];

module.exports = { createUser, tokenFor, cookieFrom };
