const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      type: String,
      required: [true, 'Please add location (district/city)'],
    },
    area: {
      type: Number,
      default: 0, // area in m2
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    numRoommates: {
      type: Number,
      default: 1,
    },
    houseRules: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    roomType: {
      type: String,
      enum: ['Shared', 'Private', 'Entire House', 'Apartment'],
      default: 'Private',
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'pending'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', RoomSchema);
