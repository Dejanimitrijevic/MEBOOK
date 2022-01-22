const Email = require('email-templates');
const path = require('path');

module.exports = (email, temp, data) => {
  const mail = new Email({
    message: {
      from: process.env.APP_EMAIL,
    },
    send: true,
    transport: {
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ava.sporer98@ethereal.email',
        pass: 'He87sBUbJJr53Cusum',
      },
    },
    juice: true,
    juiceSettings: {
      tableElements: ['TABLE'],
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, '..', 'emails', temp),
      },
    },
  });

  /// SEND EMAIL
  mail
    .send({
      template: temp,
      message: {
        to: email,
      },
      locals: data,
    })
    .then(() => {
      console.log(`EMAIL SENT 💌✅`);
    })
    .catch((err) => {
      console.log(`EMAIL ERROR 💌⛔`);
    });
};
