import request from 'supertest';

import app from '../../src/app';
import factory from '../factories';

async function createUser() {
  const user = await factory.attrs('User');

  await request(app)
    .post('/users')
    .send(user);
  return user;
}

async function createTokenAndUser(user) {
  user = user || (await createUser());

  const {
    body: { token },
  } = await request(app)
    .post('/sessions')
    .send({ email: user.email, password: user.password });
  return { token, user };
}

export { createUser, createTokenAndUser };
