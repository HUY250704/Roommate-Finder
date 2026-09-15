const mongoose = require('mongoose');

const seedDefaultAccounts = async () => {
  try {
    const User = require('../models/User');
    const Profile = require('../models/Profile');

    const adminExists = await User.findOne({ email: 'admin@roommate.com' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@roommate.com',
        password: '123456',
        role: 'admin',
        isVerified: true,
      });
      console.log('Seeded default admin account: admin@roommate.com / 123456');
    }

    const sarahExists = await User.findOne({ email: 'sarah@example.com' });
    if (!sarahExists) {
      const sarah = await User.create({
        username: 'sarah',
        email: 'sarah@example.com',
        password: '123456',
        role: 'user',
        isVerified: true,
      });
      await Profile.create({
        user: sarah._id,
        fullName: 'Sarah J.',
        gender: 'Female',
        bio: 'Looking for a neat space near downtown.',
      });
      console.log('Seeded default user account: sarah@example.com / 123456');
    }
  } catch (err) {
    console.warn('DB seed note:', err.message);
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/roommate-finder';

  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB Connected:', conn.connection.host);
      await seedDefaultAccounts();
      return;
    } catch (error) {
      console.error('MongoDB Atlas connection error:', error.message);
      console.log('Attempting connection to local MongoDB fallback...');
    }
  }

  try {
    const conn = await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB Connected (Local Fallback):', conn.connection.host);
    await seedDefaultAccounts();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.warn('Warning: Server running without active DB connection.');
  }
};

module.exports = connectDB;
