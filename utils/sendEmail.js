const Email = require('email-templates');
const path = require('path');

module.exports = (email, temp, data) => {
  const mail = new Email({
    juice: true,
    juiceSettings: {
      tableElements: ['TABLE'],
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, '..', 'emails', temp),
        images: true,
      },
    },
    message: {
      from: process.env.APP_EMAIL,
    },
    send: true,
    preview: false,
    transport: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
      console.log(err);
      console.log(`EMAIL ERROR 💌⛔`);
    });
};
