const fs = require('fs');
const BSqlite3 = require('better-sqlite3');
const path = require('path');

module.exports = {
  connection: null,
  
  getConnection: function(dbPath = path.join(__dirname, 'ConfigKobnotes.sqlite')) {
    let instanceID = Math.round(Math.random() * 1000000000);
    
    try {
      if (this.connection) {
        console.log("[ CONFIG_DB_ID =>", instanceID, "]");
        return this.connection;
      } else {
        // Verificar si el archivo existe, si no, se creará automáticamente
        this.connection = new BSqlite3(dbPath, { verbose: console.log(`[ OK ] config database loaded`) });
        console.log(`[ OK ] \x1b[33m${this.connection.name}\x1b[0m is connected...`);
        console.log("[ CONFIG_DB_ID =>", instanceID, "]");
        
        // Crear tablas necesarias
        this.createTables();
        
        return this.connection;
      }
    } catch (error) {
      console.log('[ ERROR ] Problem connecting to config database');
      console.log(error.message);
      return null;
    }
  },
  
  createTables: function() {
    const conn = this.connection;
    
    // Tabla de configuración general
    conn.prepare(`
      CREATE TABLE IF NOT EXISTS config(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(50) NOT NULL,
        description VARCHAR(100) NOT NULL,
        lang CHAR(2) NOT NULL,
        have_backup BOOLEAN DEFAULT 0,
        path_backup VARCHAR(250) NULL,
        enable_highlights BOOLEAN DEFAULT 1,
        enable_quotes BOOLEAN DEFAULT 1,
        enable_vocabulary BOOLEAN DEFAULT 0,
        enable_definitions BOOLEAN DEFAULT 0,
        enable_words BOOLEAN DEFAULT 0,
        enable_doggears BOOLEAN DEFAULT 0,
        url_dictionary VARCHAR(250) DEFAULT NULL,
        url_search VARCHAR(250) DEFAULT NULL,
        datetime_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    
    // Tabla de librerías (conexiones a bases de datos)
    conn.prepare(`
      CREATE TABLE IF NOT EXISTS libraries(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL,
        description VARCHAR(100) NULL,
        type_db VARCHAR(15) DEFAULT 'sqlite',
        path_db VARCHAR(250) NOT NULL,
        host_db VARCHAR(250) DEFAULT NULL,
        user_db VARCHAR(25) DEFAULT NULL,
        pass_db VARCHAR(25) DEFAULT NULL,
        is_active BOOLEAN DEFAULT 0,
        datetime_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
  },
  
  // Métodos para gestionar configuraciones
  getConfig: function() {
    const conn = this.getConnection();
    try {
      const stmt = conn.prepare("SELECT * FROM config LIMIT 1");
      let config = stmt.get();
      
      // Si no hay configuración, crear una por defecto
      if (!config) {
        const insertStmt = conn.prepare(`
          INSERT INTO config (title, description, lang) 
          VALUES (?, ?, ?)
        `);
        
        insertStmt.run('Default Configuration', 'Configuration created automatically', 'en');
        config = this.getConfig();
      }
      
      return config;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return null;
    }
  },
  
  updateConfig: function(configData) {
    const conn = this.getConnection();
    try {
      const fields = Object.keys(configData).filter(key => key !== 'id');
      const placeholders = fields.map(() => '?').join(', ');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => configData[field]);
      
      if (configData.id) {
        // Actualizar configuración existente
        const stmt = conn.prepare(`UPDATE config SET ${setClause} WHERE id = ?`);
        const allValues = [...values, configData.id];
        stmt.run(allValues);
      } else {
        // Insertar nueva configuración
        const stmt = conn.prepare(`INSERT INTO config (${fields.join(', ')}) VALUES (${placeholders})`);
        stmt.run(values);
      }
      
      return true;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return false;
    }
  },
  
  // Métodos para gestionar librerías
  getLibraries: function() {
    const conn = this.getConnection();
    try {
      const stmt = conn.prepare("SELECT * FROM libraries ORDER BY name");
      return stmt.all();
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return [];
    }
  },
  
  getLibrary: function(id) {
    const conn = this.getConnection();
    try {
      const stmt = conn.prepare("SELECT * FROM libraries WHERE id = ?");
      return stmt.get(id);
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return null;
    }
  },
  
  getActiveLibrary: function() {
    const conn = this.getConnection();
    try {
      const stmt = conn.prepare("SELECT * FROM libraries WHERE is_active = 1 LIMIT 1");
      return stmt.get();
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return null;
    }
  },
  
  saveLibrary: function(libraryData) {
    const conn = this.getConnection();
    try {
      const fields = Object.keys(libraryData).filter(key => key !== 'id');
      const placeholders = fields.map(() => '?').join(', ');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => libraryData[field]);
      
      if (libraryData.id) {
        // Actualizar librería existente
        const stmt = conn.prepare(`UPDATE libraries SET ${setClause} WHERE id = ?`);
        const allValues = [...values, libraryData.id];
        stmt.run(allValues);
        return libraryData.id;
      } else {
        // Insertar nueva librería
        const stmt = conn.prepare(`INSERT INTO libraries (${fields.join(', ')}) VALUES (${placeholders})`);
        const info = stmt.run(values);
        return info.lastInsertRowid;
      }
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return null;
    }
  },
  
  setActiveLibrary: function(id) {
    const conn = this.getConnection();
    try {
      // Desactivar todas las librerías
      conn.prepare("UPDATE libraries SET is_active = 0").run();
      
      // Activar la librería seleccionada
      if (id) {
        conn.prepare("UPDATE libraries SET is_active = 1 WHERE id = ?").run(id);
      }
      
      return true;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return false;
    }
  },
  
  deleteLibrary: function(id) {
    const conn = this.getConnection();
    try {
      const stmt = conn.prepare("DELETE FROM libraries WHERE id = ?");
      stmt.run(id);
      return true;
    } catch (error) {
      console.log('[ ERROR ] => ' + error.message);
      return false;
    }
  }
}; 