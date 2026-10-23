const jwt = require('jsonwebtoken');

const generateToken = (id, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured');
  }
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

module.exports = generateToken;
