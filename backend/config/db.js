const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/roommate-finder';

  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB Connected:', conn.connection.host);
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
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.warn('Warning: Server running without active DB connection. Add your IP to MongoDB Atlas whitelist.');
  }
};

module.exports = connectDB;
