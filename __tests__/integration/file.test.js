/* eslint-disable no-undef */
import request from 'supertest';
import { resolve } from 'path';
import fs from 'fs';

import app from '../../src/app';
import truncate from '../util/truncate';
import { createTokenAndUser } from '../util/functions';

describe('File', () => {
  beforeEach(async () => {
    await truncate();
  });
  afterAll(async () => {
    await new Promise(item => setTimeout(() => item(), 500)); // avoid jest open handle error
  });

  it('should be able to create a file', async () => {
    const { token } = await createTokenAndUser();

    const response = await request(app)
      .post('/files')
      .attach('file', resolve(__dirname, '..', 'util', 'test.png'))
      .set('Authorization', `bearer ${token}`);
    await fs.unlinkSync(
      resolve(__dirname, '..', '..', 'tmp', 'uploads', response.body.path)
    );
    expect(response.body).toHaveProperty('id');
  });
});
