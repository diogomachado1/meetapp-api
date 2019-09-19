import * as Yup from 'yup';
import { endOfHour, startOfHour } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../libs/Queue';
import User from '../models/User';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }
  async store(req, res) {

    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: User,
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
      return res.status(400).json({ error: `You can't subscribe past meetup` });
    }

    const subscriptions = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          required: true,
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
          .json({ error: `You can't subscribe same meetup` });
      }
      return res.status(400).json({
        error: `You can't subscribe meetup at same time another meetup`,
      });
    }

    const subscription = await Subscription.create({
      meetup_id: req.params.meetupId,
      user_id: req.userId,
    });

    const subscriptionGet = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
        {
          model: Meetup,
          attributes: ['title', 'user_id'],
          include: [
            {
              model: User,
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    await Queue.add(SubscriptionMail.key, {
      subscriptionGet,
    });

    return res.json(subscriptionGet);
  }
}

export default new SubscriptionController();
