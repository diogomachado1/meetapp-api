import { Op } from 'sequelize';
import * as Yup from 'yup';

import { endOfDay, startOfDay, parseISO, format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizingController {
  async index(req, res) {
    const {
      date = format(
        utcToZonedTime(new Date(), 'America/Fortaleza'),
        'yyyy-MM-dd'
      ),
      page = 1,
    } = req.query;
    const schema = Yup.object().shape({
      date: Yup.date().min(
        startOfDay(utcToZonedTime(new Date(), 'America/Fortaleza'))
      ),
      page: Yup.number().positive(),
    });
    const dateTimeZone = parseISO(date);

    try {
      await schema.validate({ date, page });
    } catch (error) {
      return res.status(400).json({ error: error.errors[0] });
    }
    const meetups = await Meetup.findAndCountAll({
      where: {
        user_id: {
          [Op.ne]: req.userId,
        },
        date: {
          [Op.between]: [
            zonedTimeToUtc(startOfDay(dateTimeZone), 'America/Fortaleza'),
            zonedTimeToUtc(endOfDay(dateTimeZone), 'America/Fortaleza'),
          ],
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
          as: 'file',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
      order: [['date']],
      limit: 10,
      offset: 10 * (page - 1),
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();
