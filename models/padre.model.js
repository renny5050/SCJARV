// padreNinoModel.js
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath);

// Convertimos los métodos del db a promesas (ya debería estar definido en tu archivo principal)
db.runAsync = function(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({
                lastID: this.lastID,    // Captura el último ID insertado
                changes: this.changes    // Número de filas afectadas
            });
        });
    });
};
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// Operaciones CRUD para Tb_padreNino
exports.crearPadreNino = async (padreNino) => {
    const sql = `
        INSERT INTO Tb_padreNino (codigo_perso)
        VALUES (?)
    `;
    
    const params = [padreNino.codigo_perso];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerPadreNino = async (codigo_padre) => {
    return await db.getAsync(
        "SELECT * FROM Tb_padreNino WHERE codigo_padre = ?", 
        [codigo_padre]
    );
};

exports.actualizarPadreNino = async (codigo_padre, padreNino) => {
    const sql = `
        UPDATE Tb_padreNino SET
            codigo_perso = ?
        WHERE codigo_padre = ?
    `;
    
    const params = [
        padreNino.codigo_perso,
        codigo_padre
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarPadreNino = async (codigo_padre) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_padreNino WHERE codigo_padre = ?",
        [codigo_padre]
    );
    return result.changes;
};

exports.obtenerTodosPadresNino = async () => {
    return await db.allAsync("SELECT * FROM Tb_padreNino");
};

// Agregar al final del modelo
exports.obtenerPadrePorPersona = async (codigo_perso) => {
    return await db.getAsync(
        "SELECT * FROM Tb_padreNino WHERE codigo_perso = ?", 
        [codigo_perso]
    );
};