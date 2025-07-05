// madreNinoModel.js
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

// Operaciones CRUD para Tb_madreNino
exports.crearMadreNino = async (madreNino) => {
    const sql = `
        INSERT INTO Tb_madreNino (codigo_perso)
        VALUES (?)
    `;
    
    const params = [madreNino.codigo_perso];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerMadreNino = async (codigo_madre) => {
    return await db.getAsync(
        "SELECT * FROM Tb_madreNino WHERE codigo_madre = ?", 
        [codigo_madre]
    );
};

exports.actualizarMadreNino = async (codigo_madre, madreNino) => {
    const sql = `
        UPDATE Tb_madreNino SET
            codigo_perso = ?
        WHERE codigo_madre = ?
    `;
    
    const params = [
        madreNino.codigo_perso,
        codigo_madre
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarMadreNino = async (codigo_madre) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_madreNino WHERE codigo_madre = ?",
        [codigo_madre]
    );
    return result.changes;
};

exports.obtenerTodasMadresNino = async () => {
    return await db.allAsync("SELECT * FROM Tb_madreNino");
};

// Agregar al final del modelo
exports.obtenerMadrePorPersona = async (codigo_perso) => {
    return await db.getAsync(
        "SELECT * FROM Tb_madreNino WHERE codigo_perso = ?", 
        [codigo_perso]
    );
};