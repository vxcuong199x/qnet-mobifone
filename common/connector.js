const MongoClient = require('mongodb').MongoClient;
const connection = require('../config/connection');
const conMongo = connection.mongo;

const mongoString = `mongodb://${conMongo.host}`;
const mongo = connect(mongoString, conMongo.db);

module.exports = {
  mongo
};

function connect(url, dbName) {
  console.log('mongoUrl: ', url);
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      (err, client) => {
        if (err) {
          reject(err)
        }
        resolve(client.db(dbName))
      }
    )
    
  })
}

