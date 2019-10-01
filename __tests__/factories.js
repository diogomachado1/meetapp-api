import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Meetup from '../src/app/models/Meetup';

factory.define('User', User, {
  name: factory.sequence('User.name', async n => {
    await faker.seed(n);
    return faker.name.findName();
  }),
  email: factory.sequence('User.email', async n => {
    await faker.seed(n);
    return faker.internet.email();
  }),
  password: faker.internet.password(),
});

factory.define('Meetup', Meetup, {
  title: faker.name.findName(),
  description: faker.lorem.paragraph(),
  location: faker.lorem.sentence(),
  date: faker.date.future().toISOString(),
});

export default factory;
