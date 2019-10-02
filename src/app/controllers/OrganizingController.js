import { Op } from 'sequelize';
import * as Yup from 'yup';

import { endOfDay, startOfDay, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const { date = new Date().toISOString(), page = 1 } = req.query;
    const schema = Yup.object().shape({
      date: Yup.date().min(startOfDay(new Date())),
      page: Yup.number().positive(),
    });

    try {
      await schema.validate({ date, page });
    } catch (error) {
      return res.status(400).json({ error: error.errors[0] });
    }
    const meetups = await Meetup.findAll({
      where: {
        user_id: {
          [Op.ne]: req.userId,
        },
        date: {
          [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))],
        },
      },
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
          attributes: ['name', 'path', 'url'],
        },
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
      limit: 10,
      offset: 10 * (page - 1),
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();
