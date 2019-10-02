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

describe('Subscription', () => {
  beforeEach(async () => {
    await truncate();
  });
  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  });

  it('should not be able to subscribe in your own meetup', async () => {
    const { token, meetup } = await createMeetup();
    const response = await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should be able to subscribe in another owner meetup', async () => {
    const { meetup } = await createMeetup();
    const { token } = await createTokenAndUser();
    const response = await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to subscribe in a past meetup', async () => {
    const { file, user } = await createFile();
    const meetup = await factory.create('Meetup', {
      file_id: file.id,
      date: faker.date.past(),
      user_id: user.id,
    });
    const { token } = await createTokenAndUser();
    const response = await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to subscribe in a the same meetup twice', async () => {
    const { meetup } = await createMeetup();
    const { token } = await createTokenAndUser();
    await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    const response = await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to subscribe in meetups that happen at same time', async () => {
    const { file, user } = await createFile();
    const sameTimes = faker.date.future();
    const meetup = await factory.create('Meetup', {
      file_id: file.id,
      date: sameTimes,
      user_id: user.id,
    });
    const { token } = await createTokenAndUser();

    await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    const meetup2 = await factory.create('Meetup', {
      file_id: file.id,
      date: sameTimes,
      user_id: user.id,
    });

    const response = await request(app)
      .post(`/meetups/${meetup2.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('should be able to see your subscriptions', async () => {
    const { meetup } = await createMeetup();
    const { token } = await createTokenAndUser();

    await request(app)
      .post(`/meetups/${meetup.id}/subscriptions`)
      .set('Authorization', `bearer ${token}`);

    const response = await request(app)
      .get(`/subscriptions`)
      .set('Authorization', `bearer ${token}`);
    expect(response.body).toMatchObject([{ Meetup: meetup }]);
  });
});
