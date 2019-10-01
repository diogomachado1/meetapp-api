import request from 'supertest';

import { resolve } from 'path';
import fs from 'fs';
import app from '../../src/app';
import factory from '../factories';

async function createUser() {
  let user = await factory.attrs('User');
  const { body } = await request(app)
    .post('/users')
    .send(user);
  user = { ...user, ...body };
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

async function createFile() {
  const { token, user } = await createTokenAndUser();

  const { body: file } = await request(app)
    .post('/files')
    .attach('file', resolve(__dirname, '..', 'util', 'test.png'))
    .set('Authorization', `bearer ${token}`);
  await fs.unlinkSync(
    resolve(__dirname, '..', '..', 'tmp', 'uploads', file.path)
  );
  return { file, user, token };
}

async function createMeetup() {
  const { token, user, file } = await createFile();
  const meetup = await factory.attrs('Meetup');
  const { body } = await request(app)
    .post('/meetup')
    .send({ ...meetup, file_id: file.id })
    .set('Authorization', `bearer ${token}`);
  return { meetup: body, file, user, token };
}

export { createUser, createTokenAndUser, createFile, createMeetup };
