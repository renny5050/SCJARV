// representanteModel.js
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

// Operaciones CRUD para Tb_represent
exports.crearRepresentante = async (representante) => {
    const sql = `
        INSERT INTO Tb_represent (
            parentesco_r, codigo_perso
        ) VALUES (?, ?)
    `;
    
    const params = [
        representante.parentesco_r,
        representante.codigo_perso
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerRepresentante = async (codigo_repre) => {
    return await db.getAsync(
        "SELECT * FROM Tb_represent WHERE codigo_repre = ?", 
        [codigo_repre]
    );
};

exports.actualizarRepresentante = async (codigo_repre, representante) => {
    const sql = `
        UPDATE Tb_represent SET
            parentesco_r = ?,
            codigo_perso = ?
        WHERE codigo_repre = ?
    `;
    
    const params = [
        representante.parentesco_r,
        representante.codigo_perso,
        codigo_repre
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarRepresentante = async (codigo_repre) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_represent WHERE codigo_repre = ?",
        [codigo_repre]
    );
    return result.changes;
};

exports.obtenerTodosRepresentantes = async () => {
    return await db.allAsync("SELECT * FROM Tb_represent");
};