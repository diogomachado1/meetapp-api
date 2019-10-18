/* eslint-disable no-undef */
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app';

import truncate from '../util/truncate';
import factory from '../factories';
import { createTokenAndUser } from '../util/functions';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');
    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('token');
  });

  it('should encrypt user password when new user created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });
    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('should have a name', async () => {
    const user = await factory.attrs('User', {
      name: undefined,
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should have a email', async () => {
    const user = await factory.attrs('User', {
      email: undefined,
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should have a password', async () => {
    const user = await factory.attrs('User', {
      password: undefined,
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should have a password with min 6 caracteres', async () => {
    const user = await factory.attrs('User', {
      password: '12345',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with duplicated email', async () => {
    const user = await factory.attrs('User', {
      email: 'diogomachado_8@hotmail.com',
    });

    await request(app)
      .post('/users')
      .send(user);

    const user2 = await factory.attrs('User', {
      email: 'diogomachado_8@hotmail.com',
    });

    const response = await request(app)
      .post('/users')
      .send(user2);

    expect(response.status).toBe(400);
  });
});

describe('User Create', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to update a name', async () => {
    const { token } = await createTokenAndUser();

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({ name: 'Test Name' });
    expect(response.body).toMatchObject({ name: 'Test Name' });
  });

  it('should be able to update a email', async () => {
    const { token } = await createTokenAndUser();

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({ email: 'TestEmail@email.com' });
    expect(response.body).toMatchObject({ email: 'TestEmail@email.com' });
  });

  it('should not have duplicate emails', async () => {
    const { token } = await createTokenAndUser();

    const user = await factory.attrs('User', {
      email: 'TestEmail@email.com',
    });

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({ email: 'TestEmail@email.com' });
    expect(response.status).toBe(400);
  });

  it('should be able to update a password', async () => {
    const { token, user } = await createTokenAndUser();

    await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password,
        password: '123456',
        confirmPassword: '123456',
      });
    const response = await request(app)
      .post('/sessions')
      .send({ email: user.email, password: '123456' });
    expect(response.status).toBe(200);
  });

  it('should have oldPassword to update the password', async () => {
    const { token } = await createTokenAndUser();

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        password: '123456',
        confirmPassword: '123456',
      });

    expect(response.status).toBe(400);
  });

  it('should be password equals confirmPassword to update the password', async () => {
    const { token, user } = await createTokenAndUser();

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password + 1,
        password: '123456',
        confirmPassword: '1234567',
      });

    expect(response.status).toBe(400);
  });

  it('should be correct oldPassword to update the password', async () => {
    const { token, user } = await createTokenAndUser();

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password + 1,
        password: '123456',
        confirmPassword: '123456',
      });

    expect(response.status).toBe(401);
  });
});
