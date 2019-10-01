/* eslint-disable no-undef */
import request from 'supertest';
import app from '../../src/app';

import truncate from '../util/truncate';
import { createUser } from '../util/functions';

describe('Session Create', () => {
  beforeEach(async () => {
    await truncate();
  });
  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  it('should be able to create session', async () => {
    const { email, password } = await createUser();

    const response = await request(app)
      .post('/sessions')
      .send({ email, password });

    expect(response.body).toHaveProperty('token');
  });

  it('should have email to create session', async () => {
    const { password } = await createUser();

    const response = await request(app)
      .post('/sessions')
      .send({ password });

    expect(response.status).toBe(400);
  });

  it('should have password to create session', async () => {
    const { email } = await createUser();

    const response = await request(app)
      .post('/sessions')
      .send({ email });

    expect(response.status).toBe(400);
  });

  it('should have register email to create session', async () => {
    const { email, password } = await createUser();

    const response = await request(app)
      .post('/sessions')
      .send({ email: `${email}test`, password });

    expect(response.status).toBe(401);
  });

  it('should have password match to create session', async () => {
    const { email, password } = await createUser();

    const response = await request(app)
      .post('/sessions')
      .send({ email, password: `${password}test` });

    expect(response.status).toBe(401);
  });

  it('should return a valid token to use API', async () => {
    const user = await createUser();
    const { email, password } = user;

    const {
      body: { token },
    } = await request(app)
      .post('/sessions')
      .send({ email, password });

    const response = await request(app)
      .get('/testAuth')
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should have a valid token to use API', async () => {
    const response = await request(app)
      .get('/testAuth')
      .set('Authorization', `bearer testwoken`);
    expect(response.status).toBe(401);
  });

  it('should have a token to use API', async () => {
    const response = await request(app).get('/testAuth');

    expect(response.status).toBe(401);
  });
});
