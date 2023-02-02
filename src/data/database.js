const Database = require('better-sqlite3');

const connection = new Database('./src/data/KoboReader.sqlite', { verbose: console.log('Ejecucion .sqlite: OK') });

module.exports = {
  connection: connection
}
