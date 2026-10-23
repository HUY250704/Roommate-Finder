const request = require('supertest');
const app = require('../index');
const Favorite = require('../models/Favorite');
const Room = require('../models/Room');
const Viewing = require('../models/Viewing');
const { createUser, tokenFor } = require('./helpers');

describe('favorite duplicate prevention', () => {
  it('rejects favoriting the same room twice', async () => {
    const user = await createUser();
    const owner = await createUser();
    const room = await Room.create({
      owner: owner._id,
      title: 'Room to favorite',
      price: 1000,
      address: '2 Test Street',
      location: 'Test City',
      coordinates: { type: 'Point', coordinates: [0, 0] },
      status: 'available',
    });
    const url = '/api/favorites/rooms';
    const makeRequest = () =>
      request(app)
        .post(url)
        .set('Authorization', `Bearer ${tokenFor(user)}`)
        .send({ roomId: room.id });

    expect((await makeRequest()).status).toBe(200);
    expect((await makeRequest()).status).toBe(400);
    const favorite = await Favorite.findOne({ user: user._id });
    expect(favorite.rooms.map(String)).toEqual([room.id]);
  });

  it('rejects favoriting the same roommate twice', async () => {
    const user = await createUser();
    const roommate = await createUser();
    const makeRequest = () =>
      request(app)
        .post('/api/favorites/roommates')
        .set('Authorization', `Bearer ${tokenFor(user)}`)
        .send({ roommateId: roommate.id });

    expect((await makeRequest()).status).toBe(200);
    expect((await makeRequest()).status).toBe(400);
    const favorite = await Favorite.findOne({ user: user._id });
    expect(favorite.roommates.map(String)).toEqual([roommate.id]);
  });
});

describe('viewing request validation', () => {
  it('rejects a viewing date in the past', async () => {
    const user = await createUser();
    const owner = await createUser();
    const room = await Room.create({
      owner: owner._id,
      title: 'Viewing room',
      price: 1000,
      address: '3 Test Street',
      location: 'Test City',
      coordinates: { type: 'Point', coordinates: [0, 0] },
    });

    const response = await request(app)
      .post('/api/viewings')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({ roomId: room.id, date: '2000-01-01T12:00:00.000Z' });

    expect(response.status).toBe(400);
    expect(await Viewing.countDocuments()).toBe(0);
  });

  it('returns 409 for a duplicate pending request by the same user for the same room and date', async () => {
    const user = await createUser();
    const owner = await createUser();
    const room = await Room.create({
      owner: owner._id,
      title: 'Viewing room',
      price: 1000,
      address: '4 Test Street',
      location: 'Test City',
      coordinates: { type: 'Point', coordinates: [0, 0] },
    });
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const makeRequest = () =>
      request(app)
        .post('/api/viewings')
        .set('Authorization', `Bearer ${tokenFor(user)}`)
        .send({ roomId: room.id, date });

    expect((await makeRequest()).status).toBe(201);
    expect((await makeRequest()).status).toBe(409);
    expect(await Viewing.countDocuments({ user: user._id, room: room._id, status: 'pending' })).toBe(1);
  });
});
