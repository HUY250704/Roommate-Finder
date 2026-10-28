const request = require('supertest');
const app = require('../index');
const Conversation = require('../models/Conversation');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const Room = require('../models/Room');
const { createUser, tokenFor } = require('./helpers');

describe('match calculation', () => {
  it('calculates and stores a match for two valid profiles', async () => {
    const currentUser = await createUser();
    const targetUser = await createUser();
    await Profile.create({ user: currentUser._id });
    await Profile.create({ user: targetUser._id });

    const response = await request(app)
      .post('/api/matches/calculate')
      .set('Authorization', `Bearer ${tokenFor(currentUser)}`)
      .send({ targetUserId: targetUser.id });

    expect(response.status).toBe(200);
    expect(response.body.matchScore).toEqual(expect.any(Number));
    expect(await Match.countDocuments()).toBe(1);
  });

  it('rejects a request without a target user ID', async () => {
    const currentUser = await createUser();
    const response = await request(app)
      .post('/api/matches/calculate')
      .set('Authorization', `Bearer ${tokenFor(currentUser)}`)
      .send({});

    expect(response.status).toBe(400);
  });
});

describe('private user data responses', () => {
  it('does not expose another user email in roommate search results', async () => {
    const currentUser = await createUser();
    const otherUser = await createUser({ email: 'private-roommate@example.com' });
    await Profile.create({ user: otherUser._id });

    const response = await request(app)
      .get('/api/roommates')
      .set('Authorization', `Bearer ${tokenFor(currentUser)}`);

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(otherUser.email);
  });

  it('does not expose a room owner email in room search results', async () => {
    const owner = await createUser({ email: 'private-owner@example.com' });
    await Room.create({
      owner: owner._id,
      title: 'Available room',
      price: 1000,
      address: '1 Test Street',
      location: 'Test City',
      coordinates: { type: 'Point', coordinates: [0, 0] },
      status: 'available',
    });

    const response = await request(app).get('/api/rooms');

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(owner.email);
  });

  it('does not expose another participant email in conversation messages', async () => {
    const currentUser = await createUser();
    const otherUser = await createUser({ email: 'private-chat@example.com' });
    const conversation = await Conversation.create({
      participants: [currentUser._id, otherUser._id],
    });
    await Message.create({
      conversation: conversation._id,
      sender: otherUser._id,
      text: 'Hello',
    });

    const response = await request(app)
      .get(`/api/conversations/messages/${conversation.id}`)
      .set('Authorization', `Bearer ${tokenFor(currentUser)}`);

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(otherUser.email);
  });
});
