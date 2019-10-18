import Sequelize, { Model } from 'sequelize';
import { subHours, isAfter } from 'date-fns';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {
        cancellable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isAfter(subHours(this.meetup.date, 2), new Date());
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'meetup' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Subscription;
