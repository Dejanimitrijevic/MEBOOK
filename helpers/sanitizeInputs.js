const validator = require('validator');

module.exports = (req, res, next) => {
  for (const value in req.body) {
    if (
      !value.includes(`password`) &&
      !value.includes(`Password`) &&
      !validator.isBoolean(String(req.body[value]))
    ) {
      req.body[value] = validator.trim(req.body[value]);
    }
    if (value === 'email')
      req.body.email = validator.normalizeEmail(req.body.email);
  }

  next();
};
