/* eslint-disable no-undef */
import request from 'supertest';
import faker from 'faker';

import app from '../../src/app';
import factory from '../factories';
import truncate from '../util/truncate';
import {
  createTokenAndUser,
  createFile,
  createMeetup,
} from '../util/functions';

describe('Meetups', () => {
  beforeEach(async () => {
    await truncate();
  });
  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  it('should be able to create a meetup', async () => {
    const { token, file } = await createFile();
    const meetup = await factory.attrs('Meetup');

    const response = await request(app)
      .post('/meetup')
      .set('Authorization', `bearer ${token}`)
      .send({ ...meetup, file_id: file.id });

    expect(response.body).toMatchObject(meetup);
  });

  it('should be not able to create a meetup with past date', async () => {
    const { token, file } = await createFile();
    const meetup = await factory.attrs('Meetup', {
      date: faker.date.past().toISOString(),
    });

    const response = await request(app)
      .post('/meetup')
      .set('Authorization', `bearer ${token}`)
      .send({ ...meetup, file_id: file.id });

    expect(response.status).toBe(400);
  });

  it('should be able to update a meetup', async () => {
    const { token, file, meetup } = await createMeetup();
    const newMeetup = await factory.attrs('Meetup');
    const response = await request(app)
      .put(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({ ...newMeetup, file_id: file.id });

    expect(response.body).toMatchObject(newMeetup);
  });

  it('should be not able to update a meetup to past date', async () => {
    const { token, file, meetup } = await createMeetup();
    const newMeetup = await factory.attrs('Meetup', {
      date: faker.date.past().toISOString(),
    });
    const response = await request(app)
      .put(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({ ...newMeetup, file_id: file.id });
    expect(response.status).toBe(400);
  });

  it('should be not able to update a past meetup', async () => {
    const { token, file } = await createFile();
    const meetup = await factory.create('Meetup', {
      file_id: file.id,
      date: faker.date.past(),
    });
    const newMeetup = await factory.attrs('Meetup');
    const response = await request(app)
      .put(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({ ...newMeetup, file_id: file.id });
    expect(response.status).toBe(400);
  });

  it('should be not able to update a meetup with another owner', async () => {
    const { file, meetup } = await createMeetup();
    const { token } = await createTokenAndUser();
    const newMeetup = await factory.attrs('Meetup');
    const response = await request(app)
      .put(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({ ...newMeetup, file_id: file.id });
    expect(response.status).toBe(401);
  });

  it('should be able to owner see your meetups', async () => {
    const { token, meetup } = await createMeetup();
    const response = await request(app)
      .get(`/meetup`)
      .set('Authorization', `bearer ${token}`);
    expect(response.body).toMatchObject([meetup]);
  });

  it('should be able to owner see one your meetups', async () => {
    const { token, meetup } = await createMeetup();
    const response = await request(app)
      .get(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`);
    expect(response.body).toMatchObject(meetup);
  });

  it('should be able to owner delete your meetups', async () => {
    const { token, meetup } = await createMeetup();
    const response = await request(app)
      .delete(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(204);
  });

  it('should not be able to delete a past meetups', async () => {
    const { token, file, user } = await createFile();
    const meetup = await factory.create('Meetup', {
      file_id: file.id,
      date: faker.date.past(),
      user_id: user.id,
    });

    const response = await request(app)
      .delete(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(400);
  });

  it('should not be able to delete a meetups with another owner', async () => {
    const { meetup } = await createMeetup();
    const { token } = await createTokenAndUser();
    const response = await request(app)
      .delete(`/meetup/${meetup.id}`)
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(401);
  });
});
