module.exports = (req, ...fields) => {
  let Obj = {};
  fields.map((field) => {
    for (const key in req) {
      key === field ? (Obj[key] = req[key]) : null;
    }
  });
  return Obj;
};
