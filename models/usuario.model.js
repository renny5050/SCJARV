// models/UserModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos SQLite
const dbPath = path.resolve(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

const User = {
  // Obtener todos los usuarios
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Obtener un usuario por ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Insertar un nuevo usuario
  create: (name) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (name) VALUES (?)', [name], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  // Actualizar un usuario
  update: (id, name) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  },

  // Eliminar un usuario
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
};

// Exportar el modelo
module.exports = User;