const fs = require('fs');
const BSqlite3 = require('better-sqlite3');

module.exports = {
  getConnection: function(){
    let instanceID = Math.round(Math.random()*1000000000);
    try {
      fs.readFileSync(".\\src\\data\\KoboReader.sqlite");
      if (this.connection) {
        console.log("[ CALL_DB_ID =>", instanceID,"]");
        return this.connection;
      } else {
        this.connection = new BSqlite3('./src/data/KoboReader.sqlite', {fileMustExist:true, verbose: console.log('[ OK ] KoboReader.sqlite connected...') });
        console.log("[ CALL_DB_ID =>", instanceID,"]");
        return this.connection;
      }
    } catch (error) {
      console.log('[ ERROR ] NO EXISTS FILE .sqlite');
      console.log(error.message);
    }
  }
};
