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
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        validate: {
          validator(value) {
            return value.length === 2 &&
              Number.isFinite(value[0]) &&
              Number.isFinite(value[1]) &&
              value[0] >= -180 && value[0] <= 180 &&
              value[1] >= -90 && value[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] within valid ranges',
        },
      },
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
      enum: ['pending', 'approved', 'available', 'rented', 'rejected', 'removed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Room', RoomSchema);