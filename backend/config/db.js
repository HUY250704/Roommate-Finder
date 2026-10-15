const mongoose = require('mongoose');

const seedDefaultAccounts = async () => {
  try {
    const User = require('../models/User');
    const Profile = require('../models/Profile');

    const adminExists = await User.findOne({ email: 'admin@roommate.com' });
    if (!adminExists) {
      const adminPassword = process.env.ADMIN_SEED_PASSWORD;
      if (!adminPassword || adminPassword.length < 12) {
        console.warn('Admin seed skipped: set ADMIN_SEED_PASSWORD to a value of at least 12 characters.');
      } else {
        const usernameBase = process.env.ADMIN_SEED_USERNAME || 'admin';
        let username = usernameBase;
        let suffix = 1;
        while (await User.exists({ username })) {
          username = `${usernameBase}${suffix}`;
          suffix += 1;
        }

        await User.create({
          username,
          email: 'admin@roommate.com',
          password: adminPassword,
          role: 'admin',
          isVerified: true,
        });
        console.log('Seeded default admin account.');
      }
    }

    if (process.env.NODE_ENV === 'development' && process.env.DEV_DEMO_SEED === 'true') {
      const demoPassword = process.env.DEV_DEMO_USER_PASSWORD;
      if (!demoPassword || demoPassword.length < 12) {
        console.warn('Demo user seed skipped: set DEV_DEMO_USER_PASSWORD to at least 12 characters.');
        return;
      }

      const demoUserExists = await User.findOne({ email: 'sarah@example.com' });
      if (!demoUserExists) {
        const demoUser = await User.create({
          username: 'sarah',
          email: 'sarah@example.com',
          password: demoPassword,
          role: 'user',
          isVerified: true,
        });

        try {
          await Profile.create({
            user: demoUser._id,
            fullName: 'Sarah J.',
            gender: 'female',
            bio: 'Looking for a neat space near downtown.',
          });
        } catch (error) {
          await User.deleteOne({ _id: demoUser._id });
          throw error;
        }

        console.log('Seeded development demo user.');
      }
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
