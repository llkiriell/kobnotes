const fs = require('fs');
const BSqlite3 = require('better-sqlite3');
const MongoDB = require('./mongodb');
const configDB = require('./configDB');
const path = require('path');

module.exports = {
  connection: null,
  connectionPath: null,
  
  // Obtiene la conexión a la base de datos de libros seleccionada
  getConnection: function(customPath = null) {
    let instanceID = Math.round(Math.random() * 1000000000);
    
    try {
      // Si se proporciona una ruta personalizada, úsala
      if (customPath) {
        // Si ya hay una conexión abierta a otra base de datos, ciérrala
        if (this.connection && this.connectionPath !== customPath) {
          this.closeConnection();
        }
        
        // Si no hay conexión activa o la ruta es diferente, crear nueva conexión
        if (!this.connection || this.connectionPath !== customPath) {
          this.connectionPath = customPath;
          this.connection = new BSqlite3(customPath, {fileMustExist: true, verbose: console.log(`[ OK ] database loaded`) });
          console.log(`[ OK ] \x1b[33m${this.connection.name}\x1b[0m is connected...`);
          console.log("[ BOOKS_DB_ID =>", instanceID, "]");
        }
        
        return this.connection;
      } 
      // Si no hay ruta personalizada, intentar usar la librería activa
      else {
        // Obtener la librería activa de la base de datos de configuración
        const activeLibrary = configDB.getActiveLibrary();
        
        if (activeLibrary) {
          // Si ya hay una conexión abierta a otra base de datos, ciérrala
          if (this.connection && this.connectionPath !== activeLibrary.path_db) {
            this.closeConnection();
          }
          
          // Si no hay conexión activa o la ruta es diferente, crear nueva conexión
          if (!this.connection || this.connectionPath !== activeLibrary.path_db) {
            this.connectionPath = activeLibrary.path_db;
            fs.readFileSync(activeLibrary.path_db); // Verificar que el archivo existe
            this.connection = new BSqlite3(activeLibrary.path_db, {fileMustExist: true, verbose: console.log(`[ OK ] database loaded`) });
        console.log(`[ OK ] \x1b[33m${this.connection.name}\x1b[0m is connected...`);
            console.log("[ BOOKS_DB_ID =>", instanceID, "]");
          }
          
        return this.connection;
        } else {
          console.log('[ ERROR ] No active library found');
          return null;
        }
      }
    } catch (error) {
      console.log('[ ERROR ] NO EXISTS FILE .sqlite');
      console.log(error.message);
      return null;
    }
  },
  
  closeConnection: function() {
    if (this.connection) {
      try {
        this.connection.close();
        console.log('[ OK ] Database connection closed');
      } catch (error) {
        console.log('[ ERROR ] Error closing database connection');
        console.log(error.message);
      } finally {
        // Asegurar que las variables de conexión se reinicien incluso si hay error
        this.connection = null;
        this.connectionPath = null;
      }
    }
  },
  
  getTableNames: function() {
    const con = this.getConnection();
    if (!con) return [];
    
    try {
      const stmt = con.prepare(`SELECT * FROM sqlite_schema WHERE type ='table' ORDER BY tbl_name;`);
      let tableNames = stmt.all();
      return tableNames;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return [];
    }
  },
  
  getDataTable: function(tableName) {
    const con = this.getConnection();
    if (!con) return [];
    
    try {
      const stmt = con.prepare("SELECT * FROM " + tableName + " ;");
      let columnNames = stmt.all();
      return columnNames;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return [];
    }
  },
  
  getColumnNames: function(tbl) {
    const con = this.getConnection();
    if (!con) return [];
    
    try {
      const stmt = con.prepare('PRAGMA table_info('+tbl+');');
      let columnNames = stmt.all();
      return columnNames;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return [];
    }
  },
  
  migrateToMongoDB: async function () {
    let tablas = this.getTableNames();
    if (tablas.length === 0) return;

    for (let index = 0; index < tablas.length; index++) {
      let nombre = tablas[index].tbl_name;
      let data = this.getDataTable(nombre);

      let collection = await MongoDB.createCollectionDB(nombre);
      await MongoDB.createDocumentDB(collection, data);
    }

    MongoDB.closeClient();
  },
  
  // Método para verificar si una base de datos SQLite es válida
  validateSQLiteDB: function(dbPath) {
    try {
      // Intentar abrir la conexión temporalmente
      const tempConn = new BSqlite3(dbPath, {fileMustExist: true});
      
      // Verificar si tiene las tablas esperadas (por ejemplo, para una base de datos de Kobo)
      let hasValidTables = false;
      
      try {
        const stmt = tempConn.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('content', 'bookmark');`);
        const tables = stmt.all();
        hasValidTables = tables.length > 0;
      } catch (error) {
        console.log('[ ERROR ] Error validating tables');
        console.log(error.message);
      }
      
      // Cerrar la conexión temporal
      tempConn.close();
      
      return hasValidTables;
    } catch (error) {
      console.log('[ ERROR ] Invalid SQLite database');
      console.log(error.message);
      return false;
    }
  }
};
//test migration sqlite to mongodb
//module.exports.migrateToMongoDB();
