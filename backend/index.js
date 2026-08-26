require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roommate-finder');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route to verify
app.get('/', (req, res) => {
  res.json({ message: 'Roommate Finder API is running...' });
});

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
