const Email = require('email-templates');
const path = require('path');

module.exports = (email, temp, data) => {
  const mail = new Email({
    message: {
      from: process.env.APP_EMAIL,
    },
    transport: {
      jsonTransport: true,
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
