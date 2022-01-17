const mongoose = require("mongoose");

let DB_URL;
if (process.env.NODE_ENV === "development") {
  DB_URL = process.env.LOCAL_MONGO_DB_URL;
}
if (process.env.NODE_ENV === "production") {
  DB_URL = process.env.HOSTED_MONGO_DB_URL;
}

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log(`DB CONNECTED ✅`);
  })
  .catch((err) => {
    console.log(`DB ERROR ⛔`);
  });
