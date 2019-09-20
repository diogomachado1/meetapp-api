import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class OrganizingController {
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
          attributes: ['name', 'path', 'url'],
        },
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new OrganizingController();
