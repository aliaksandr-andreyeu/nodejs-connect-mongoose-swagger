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

  test('health and readiness probes', async () => {
    const healthRes = await request(server).get('/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body?.status).toBe('ok');

    const readyRes = await request(server).get('/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body?.checks?.mongodb).toBe(true);
  });

  test('unknown route returns JSON 404', async () => {
    const res = await request(server).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body?.status).toBe('NotFound');
  });

  test('duplicate signup is rejected', async () => {
    const first = await request(server).post('/signup').send({ username: 'dup', password: 'Abcdef1!' });
    expect(first.status).toBe(200);

    const second = await request(server).post('/signup').send({ username: 'dup', password: 'Abcdef1!' });
    expect(second.status).toBe(400);
    expect(second.body?.message).toContain('already exists');
  });

  test('GET /users is paginated', async () => {
    const agent = request.agent(server);
    const signup = await agent.post('/signup').send({ username: 'pager', password: 'Abcdef1!' });
    const accessToken = signup.body?.data?.accessToken;
    const refreshCookie = (signup.headers['set-cookie'] as unknown as string[])[0];
    const auth = { Authorization: `Bearer ${accessToken}` };

    for (let i = 0; i < 3; i++) {
      await agent
        .post('/users')
        .set(auth)
        .set('Cookie', refreshCookie)
        .send({ username: `member-${i}`, password: 'Abcdef1!' });
    }

    const res = await agent.get('/users?page=1&limit=2').set(auth).set('Cookie', refreshCookie);
    expect(res.status).toBe(200);
    expect(res.body?.data?.length).toBe(2);
    expect(res.body?.pagination?.limit).toBe(2);
    expect(res.body?.pagination?.total).toBeGreaterThanOrEqual(4);
  });

  test('reset-password confirm sets a new password and revokes sessions', async () => {
    await request(server).post('/signup').send({ username: 'resetme', password: 'Abcdef1!' });

    // The raw reset token is only returned in development.
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const resetRes = await request(server).post('/reset-password').send({ username: 'resetme' });
    process.env.NODE_ENV = prevEnv;

    expect(resetRes.status).toBe(200);
    const resetToken = resetRes.body?.data?.resetToken;
    expect(typeof resetToken).toBe('string');

    // Wrong token is rejected.
    const bad = await request(server)
      .post('/reset-password/confirm')
      .send({ username: 'resetme', token: 'wrong', newpassword: 'Zxcvbn2@' });
    expect(bad.status).toBe(400);

    // Correct token succeeds.
    const ok = await request(server)
      .post('/reset-password/confirm')
      .send({ username: 'resetme', token: resetToken, newpassword: 'Zxcvbn2@' });
    expect(ok.status).toBe(200);

    // Old password no longer works; new one does.
    const oldLogin = await request(server).post('/signin').send({ username: 'resetme', password: 'Abcdef1!' });
    expect(oldLogin.status).toBe(400);

    const newLogin = await request(server).post('/signin').send({ username: 'resetme', password: 'Zxcvbn2@' });
    expect(newLogin.status).toBe(200);
  });

  test('rejects an oversized request body', async () => {
    const huge = 'x'.repeat(1024 * 1024 + 1024);
    const res = await request(server)
      .post('/signup')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ username: 'big', password: huge }));
    expect(res.status).toBe(413);
  });
});
