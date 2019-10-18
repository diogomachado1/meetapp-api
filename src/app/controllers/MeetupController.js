import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async show(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      where: { user_id: req.userId },
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'file_id',
        'user_id',
      ],
      include: [
        {
          model: File,
          as: 'file',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    return res.json(meetup);
  }

  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'file_id',
        'user_id',
      ],
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
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    try {
      await schema.validate(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.errors[0] });
    }

    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const {
      title,
      description,
      location,
      date,
      id,
      user_id,
    } = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json({ title, description, location, date, id, user_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    try {
      await schema.validate(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.errors[0] });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: `You can't update past meetup` });
    }

    const hourStart = startOfHour(parseISO(req.body.date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    const { title, description, location, date } = await meetup.update(
      req.body
    );

    return res.json({ title, description, location, date });
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: `You can't delete past meetup` });
    }

    await meetup.destroy();

    return res.status(204).send();
  }
}

export default new MeetupController();
