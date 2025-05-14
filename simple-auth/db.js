const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Создание таблицы (если не существует)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER,
      type TEXT,
      text TEXT,
      left TEXT,
      top TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);


  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fromBlockId INTEGER,
      toBlockId INTEGER,
      FOREIGN KEY(fromBlockId) REFERENCES blocks(id),
      FOREIGN KEY(toBlockId) REFERENCES blocks(id)
    )
  `);
});

module.exports = db;
