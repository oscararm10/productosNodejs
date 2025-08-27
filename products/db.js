const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./productos.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL
  )`);
});

module.exports = db;
