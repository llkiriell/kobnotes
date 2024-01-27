const fs = require('fs');
const BSqlite3 = require('better-sqlite3');
const MongoDB = require('./mongodb');

module.exports = {
  getConnection: function(path = ".\\src\\data\\KoboReader.sqlite"){
    let instanceID = Math.round(Math.random()*1000000000);
    try {
      fs.readFileSync(path);
      if (this.connection) {
        console.log("[ CALL_DB_ID =>", instanceID,"]");
        return this.connection;
      } else {
        this.connection = new BSqlite3(path, {fileMustExist:true, verbose: console.log(`[ OK ] database loaded`) });
        console.log(`[ OK ] \x1b[33m${this.connection.name}\x1b[0m is connected...`);
        console.log("[ CALL_DB_ID =>", instanceID,"]");
        this.createTableConfig();
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
  },
  createTableConfig: function(){
    let conn = this.connection;
    let stmt = conn.prepare(`
      CREATE TABLE IF NOT EXISTS dbconfig(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(50) NOT NULL,
        description VARCHAR(100) NOT NULL,
        lang CHAR(2) NOT NULL,
        have_backup BOOLEAN DEFAULT 0,
        path_backup VARCHAR(250) NULL,
        type_db VARCHAR(15) DEFAULT 'sqlite',
        name_db VARCHAR(50) DEFAULT 'KoboReader.sqlite',
        host_db VARCHAR(250) DEFAULT 'src\data',
        user_db VARCHAR(25) DEFAULT NULL,
        pass_db VARCHAR(25) DEFAULT NULL,
        enable_highlights BOOLEAN DEFAULT 1,
        enable_quotes BOOLEAN DEFAULT 1,
        enable_vocabulary BOOLEAN DEFAULT 0,
        enable_definitions BOOLEAN DEFAULT 0,
        enable_words BOOLEAN DEFAULT 0,
        enable_doggears BOOLEAN DEFAULT 0,
        url_dictionary VARCHAR(250) DEFAULT NULL,
        url_search VARCHAR(250) DEFAULT NULL,
        datetime_creation DATETIME
      );
    `);
    let info = stmt.run();
    //console.log(info.changes);
  }
};
//test migration sqlite to mongodb
//module.exports.migrateToMongoDB();
