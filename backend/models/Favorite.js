const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
      },
    ],
    roommates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Favorite', FavoriteSchema);
