const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'roommate-finder-test-secret';

let mongoServer;
const usesDatabase = !expect.getState().testPath.endsWith('pagination.test.js');

beforeAll(async () => {
  if (!usesDatabase) return;
  mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  await mongoose.connect(mongoServer.getUri());
}, 600000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  if (!mongoServer) return;
  await mongoose.disconnect();
  await mongoServer.stop();
}, 60000);

jest.setTimeout(120000);
