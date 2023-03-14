const { MongoClient } = require('mongodb');
const configuration = require('../models/configuration');

module.exports = {
  getConnection: async function(){
    const {url,dbname} = configuration.read().data.extraDatabases.mongodb;
    if (!this.clientMongoDB) {
      this.clientMongoDB = new MongoClient(url);
      try {
        await this.clientMongoDB.db(dbname).command({ ping: 1 });
        console.log('[mongodb] connection host = ' + url + ' ; dbname = ' +dbname);
        return this.clientMongoDB.db(dbname);
      } catch (error) {
        console.log('[ ERROR - mongodb ]',error.message);
      }
    } else {
      return this.clientMongoDB.db(dbname);
    }
  },
  createCollectionDB: async function (collectionName) {
    let con = await this.getConnection();
    try {
      let rpta = await con.createCollection(collectionName,function (err, res) {
        if (err) {
          console.log(err);
        }
      });
      return rpta.s.namespace.collection;
    } catch (error) {
      return error.message;
    }
  },
  createDocumentDB: async function (collectionName,documents) {
    let con = await this.getConnection();
    let coll =  con.collection(collectionName);
    try {
      const insertResult = await coll.insertMany(documents);
      // console.log('Inserted documents =>', insertResult);
      return insertResult;
    } catch (error) {
      return error.message;
    }
  },
  closeClient:function() {
    this.clientMongoDB.close();
  }
};

// module.exports.getConnection();
// module.exports.createCollectionDB('test');


