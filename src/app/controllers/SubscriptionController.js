import { endOfHour, startOfHour } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../libs/Queue';
import User from '../models/User';
import Notification from '../schemas/Notification';
import File from '../models/File';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          include: [
            {
              model: File,
              as: 'file',
              attributes: ['name', 'path', 'url'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
          as: 'user',
          required: true,
        },
      ],
    });

    if (!meetup) {
      return res.status(400).json({ error: "Meet up don't exists" });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: "You can't subscribe in your own meet up" });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "You can't subscribe past meetup" });
    }

    const subscriptions = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
          as: 'meetup',
          where: {
            date: {
              [Op.between]: [startOfHour(meetup.date), endOfHour(meetup.date)],
            },
          },
        },
      ],
    });

    if (subscriptions) {
      if (subscriptions.meetup_id === meetup.id) {
        return res
          .status(400)
          .json({ error: "You can't subscribe same meetup" });
      }
      return res.status(400).json({
        error: "You can't subscribe in meetups that happen at same time",
      });
    }

    const subscription = await (await Subscription.create(
      {
        meetup_id: req.params.meetupId,
        user_id: req.userId,
      },
      {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email'],
          },
          {
            model: Meetup,
            as: 'meetup',
            attributes: ['title', 'user_id'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'email'],
              },
            ],
          },
        ],
      }
    )).reload();
    await Notification.create({
      content: `Nova inscrição de ${subscription.user.name} no meetup "${subscription.meetup.title}".`,
      user: subscription.meetup.user_id,
    });
    if (process.env.NODE_ENV !== 'test') {
      await Queue.add(SubscriptionMail.key, {
        subscription,
      });
    }
    return res.json(subscription);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const subscription = await Subscription.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['title', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({ error: 'subscriptions not found' });
    }

    if (subscription.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (!subscription.cancellable) {
      return res.status(400).json({ error: `You can't cancel subscribe` });
    }

    await subscription.destroy();
    await Notification.create({
      content: `O usuario ${subscription.user.name} cancelou a inscrição no meetup "${subscription.meetup.title}".`,
      user: subscription.meetup.user_id,
    });

    return res.status(204).send();
  }
}

export default new SubscriptionController();
