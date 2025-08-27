const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./inventarios.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS inventarios (
    producto_id INTEGER PRIMARY KEY,
    cantidad INTEGER
  )`);
});

module.exports = db;
