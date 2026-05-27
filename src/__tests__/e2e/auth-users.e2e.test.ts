import http from 'http';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { userModel } from '@models';

let mongod: MongoMemoryServer;
let server: http.Server;

const startAppServer = async () => {
  const { default: app } = await import('@app');
  server = http.createServer(app());
};

describe('e2e: auth + users', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'test' });
    await startAppServer();
  }, 60_000);

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  test('signup → create user → list users → get user by id', async () => {
    const agent = request.agent(server);

    const signupRes = await agent.post('/signup').send({ username: 'u1', password: 'Abcdef1!' });
    expect(signupRes.status).toBe(200);
    expect(signupRes.headers['set-cookie']).toBeDefined();
    const accessToken = signupRes.body?.data?.accessToken;
    expect(typeof accessToken).toBe('string');
    const cookies = signupRes.headers['set-cookie'];
    const refreshCookie = (Array.isArray(cookies) ? cookies : [cookies])[0];

    const createRes = await agent
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie)
      .send({ username: 'u2', name: 'John', surname: 'Doe', job: 'Dev', age: 30, isActive: true });
    expect(createRes.status).toBe(201);
    const createdId = createRes.body?.data?.id;
    expect(typeof createdId).toBe('string');

    const listRes = await agent
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body?.data)).toBe(true);

    const getRes = await agent
      .get(`/users/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body?.data?.id).toBe(createdId);
  });
});
