const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    lifestyle: {
      smoking: {
        type: String,
        enum: ['non-smoker', 'smoker', 'occasional', 'no-preference'],
        default: 'non-smoker',
      },
      pets: {
        type: String,
        enum: ['no pets', 'has pets', 'pet friendly'],
        default: 'pet friendly',
      },
      sleepSchedule: {
        type: String,
        enum: ['early bird', 'night owl', 'flexible'],
        default: 'flexible',
      },
      cleanliness: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
      },
      hobbies: {
        type: [String],
        default: [],
      },
    },
    searchPreferences: {
      budgetMin: {
        type: Number,
        default: 0,
      },
      budgetMax: {
        type: Number,
        default: 100000000,
      },
      location: {
        type: String,
        default: '',
      },
      preferredGender: {
        type: String,
        enum: ['male', 'female', 'other', 'any'],
        default: 'any',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', ProfileSchema);
