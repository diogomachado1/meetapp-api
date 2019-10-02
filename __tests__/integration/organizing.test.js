/* eslint-disable no-undef */
import request from 'supertest';

import { addMinutes, isSameDay, parseISO } from 'date-fns';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';
import { createTokenAndUser } from '../util/functions';

describe('Organizing', () => {
  beforeEach(async () => {
    await truncate();
  });
  afterAll(async () => {
    await new Promise(item => setTimeout(() => item(), 500)); // avoid jest open handle error
  });

  it('should be able to list meetups to subscribe', async () => {
    const { user } = await createTokenAndUser();
    const date = addMinutes(new Date(), 10);
    await factory.createMany('Meetup', 20, {
      date,
      user_id: user.id,
    });
    const { token } = await createTokenAndUser();

    const response = await request(app)
      .get('/organizing')
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('should be able to list meetups to subscribe in a specific date', async () => {
    const { user } = await createTokenAndUser();
    const date = addMinutes(new Date(), 10);
    await factory.createMany('Meetup', 20, {
      date,
      user_id: user.id,
    });
    const { token } = await createTokenAndUser();
    const response = await request(app)
      .get(`/organizing?date=${date.toISOString()}`)
      .set('Authorization', `bearer ${token}`);
    expect(isSameDay(date, parseISO(response.body[0].date))).toBe(true);
  });
});
