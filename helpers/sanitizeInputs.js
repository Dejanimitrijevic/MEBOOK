const validator = require('validator');

module.exports = (req, res, next) => {
  for (const value in req.body) {
    if (!value.startsWith('password'))
      req.body[value] = validator.trim(req.body[value]);
    if (value === 'email')
      req.body.email = validator.normalizeEmail(req.body.email);
  }
  next();
};
