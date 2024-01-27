const db = require('../data/database');
const NodeCache = require('node-cache');
const localCache = new NodeCache();

function obtenerHoraActual() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  const hours = String(ahora.getHours()).padStart(2, '0');
  const minutes = String(ahora.getMinutes()).padStart(2, '0');
  const seconds = String(ahora.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  exist: function () {

  },
  create: function (config) {
    let {title, description, lang, have_backup, path_backup, type_db, name_db, host_db, user_db, pass_db, enable_notes, enable_highlights, enable_quotes, enable_vocabulary, enable_definitions, enable_words, enable_dogears, url_dictionary, url_search, datetime_creation} = config;

    try {
      const stmt = db.getConnection().prepare(`
      INSERT INTO libraries
      (title, description, lang, have_backup, path_backup, type_db, name_db, host_db, user_db, pass_db, enable_notes, enable_highlights, enable_quotes, enable_vocabulary, enable_definitions, enable_words, enable_dogears, url_dictionary, url_search, datetime_creation)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);

      var res = stmt.run(title, description, lang, have_backup, path_backup, type_db, name_db, host_db, user_db, pass_db, enable_notes, enable_highlights, enable_quotes, enable_vocabulary, enable_definitions, enable_words, enable_dogears, url_dictionary, url_search, datetime_creation);

      if(res.changes > 0){
        console.log(`\x1b[32m[ ${obtenerHoraActual()} ][ OK ] Add config in database.\x1b[0m`);
      }
      return { "status": "OK", "data": res };
    } catch (error) {
      console.log(`\x1b[31m[ ${obtenerHoraActual()} ][ ERROR ] ${error.message}.\x1b[0m`);
      return { "status": "ERROR", "data": error.message };
    }
  },
  list: function () {
    if (localCache.has("configs")) {
      return { "status": "OK", "data": localCache.get('configs') };
    } else {
      try {
        const stmt = db.getConnection().prepare(`
          SELECT * FROM libraries;
        `);
        var rows = stmt.all();
        localCache.set("configs", rows, 0);
        return { "status": "OK", "data": rows };
      } catch (error) {
        return { "status": "ERROR", "data": error.message };
      }
    }
  },
  update: function (uConfig) {
    try {
      const stmt = db.getConnection().prepare(`
        UPDATE libraries
        SET 
        title=:title, 
        description=:description, 
        lang=:lang, 
        have_backup=:have_backup, 
        path_backup=:path_backup,
        type_db=:type_db,  
        name_db=:name_db,  
        host_db=:host_db,  
        user_db=:user_db,  
        pass_db=:pass_db,
        enable_notes=:enable_notes,
        enable_highlights=:enable_highlights, 
        enable_quotes=:enable_quotes, 
        enable_vocabulary=:enable_vocabulary, 
        enable_definitions=:enable_definitions, 
        enable_words=:enable_words, 
        enable_dogears=:enable_dogears, 
        url_dictionary=:url_dictionary, 
        url_search=:url_search, 
        datetime_creation=:datetime_creation
        WHERE id=:id;`);

      var res = stmt.run(uConfig);

      if(res.changes > 0){
        console.log(`\x1b[33m[ ${obtenerHoraActual()} ][ OK ] update\x1b[0m { id : ${uConfig.id} } \x1b[33mconfig in database.\x1b[0m`);
      }
      return { "status": "OK", "data": res };
    } catch (error) {
      console.log(`\x1b[31m[ ${obtenerHoraActual()} ][ ERROR ] ${error.message}.\x1b[0m`);
      return { "status": "ERROR", "data": error.message };
    }
  },
  delete: function (id) {
    try {
      const stmt = db.getConnection().prepare(`
      DELETE FROM libraries
      WHERE id=?;`);

      let res = stmt.run(id);

      if(res.changes > 0){
        console.log(`\x1b[31m[ ${obtenerHoraActual()} ][ OK ] delete\x1b[0m { id : ${id} } \x1b[31mconfig in database.\x1b[0m`);
      }
      return { "status": "OK", "data": res };
    } catch (error) {
      console.log(`\x1b[31m[ ${obtenerHoraActual()} ][ ERROR ] ${error.message}.\x1b[0m`);
      return { "status": "ERROR", "data": error.message };
    }
  },
  findId: function (id) {
    try {
      const stmt = db.getConnection().prepare(`
        SELECT * FROM libraries WHERE id=?;
      `).bind(id);
      let row = stmt.get();

      return { "status": "OK", "data": row };
    } catch (error) {
      return { "status": "ERROR", "data": error.message };
    }
  },
}