module.exports = (data, ...fields) => {
  let missed = false;
  fields.find((field) => {
    if (!Object.keys(data).includes(field) || !data[field]) {
      missed = true;
    }
  });
  return missed;
};
