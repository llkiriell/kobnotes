const fs = require('fs');
const BSqlite3 = require('better-sqlite3');
const MongoDB = require('./mongodb');

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
  },
  getTableNames: function() {
    const con = this.getConnection();
    try {
      const stmt = con.prepare(`SELECT * FROM sqlite_schema WHERE type ='table' ORDER BY tbl_name;`);
      let tableNames = stmt.all();
      return tableNames;
    } catch (error) {
      return '[ ERROR ] => ' + error.message;
    }
  },
  getDataTable: function(tableName) {
    const con = this.getConnection();
    try {
      const stmt = con.prepare("SELECT * FROM " + tableName + " ;");
      let columnNames = stmt.all();
      return columnNames;
    } catch (error) {
      return '[ ERROR ] => ' + error.message;
    }
  },
  getColumnNames: function(tbl) {
    const con = this.getConnection();
    try {
      const stmt = con.prepare('PRAGMA table_info('+tbl+');');
      // const stmt = con.prepare('select * from '+ tbl+';');
      let columnNames = stmt.all();
      return columnNames;
    } catch (error) {
      return '[ ERROR ] => ' + error.message;
    }
  },
  migrateToMongoDB: async function () {
    // let conn = await MongoDB.getConnection();
    let tablas = this.getTableNames();

    for (let index = 0; index < tablas.length; index++) {
      let nombre = tablas[index].tbl_name;
      let data = this.getDataTable(nombre);

      let collection = await MongoDB.createCollectionDB(nombre);
      await MongoDB.createDocumentDB(collection,data);
    }

    MongoDB.closeClient();
  }
};
//test migration sqlite to mongodb
//module.exports.migrateToMongoDB();
