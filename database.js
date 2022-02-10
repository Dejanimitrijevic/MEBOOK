const mongoose = require('mongoose');

let DB_URL;
if (process.env.NODE_ENV === 'development') {
  DB_URL = process.env.LOCAL_MONGO_DB_URL;
}
if (process.env.NODE_ENV === 'production') {
  DB_URL = process.env.HOSTED_MONGO_DB_URL;
}

class DatabaseOperations {
  constructor() {
    // CONNECT APP DATABASE
    this.connectDB = () => {
      mongoose
        .connect(DB_URL)
        .then(() => {
          console.log(`DB CONNECTED ✅`);
        })
        .catch(() => {
          console.log(`DB ERROR ⛔`);
        });
    };
    // EXPORT DATA TO DB COLLECTION
    this.updateDbCollection = async (collection, data) => {
      await collection.create(data);
      console.log('DONE');
    };

    // CLEAR COLLECTION
    this.clearCollection = async (collection) => {
      await collection.deleteMany();
      console.log('DONE');
    };
  }
}

module.exports = new DatabaseOperations();
