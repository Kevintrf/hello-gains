const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db);

var _db;

module.exports = {
  connectToServer: async function (callback) {

    try {
      await client.connect();
    } catch (e) {
      console.error(e);
    }

    _db = client.db("YourDatabaseName");

    return (_db === undefined ? false : true);
  },

  getDb: function () {
    return _db;
  },
};