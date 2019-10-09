import Mail from '../../libs/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscription } = data;
    await Mail.sendMail({
      to: `${subscription.meetup.user.name} <${subscription.meetup.user.email}>`,
      subject: 'Nova inscriçao!',
      template: 'subscription',
      context: {
        provider: subscription.meetup.user.name,
        user: subscription.user.name,
        meetup: subscription.meetup.title,
      },
    });
  }
}

export default new SubscriptionMail();
