import Mail from '../../libs/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscriptionGet: subscrisption } = data;
    await Mail.sendMail({
      to: `${subscrisption.meetup.user.name} <${subscrisption.meetup.user.email}>`,
      subject: 'Nova inscriçao!',
      template: 'subscription',
      context: {
        provider: subscrisption.meetup.user.name,
        user: subscrisption.user.name,
        meetup: subscrisption.meetup.title,
      },
    });
  }
}

export default new SubscriptionMail();
