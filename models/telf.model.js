const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath);

// Convertimos los métodos del db a promesas
db.runAsync = function(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({
                lastID: this.lastID,    // Captura el último ID insertado
            });
        });
    });
};
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// Operaciones CRUD para Tb_telefonop
exports.crearTelefono = async (telefono) => {
    const sql = `
        INSERT INTO Tb_telefonop (
            prin_telefono, sec_telefono, cas_telefono, codigo_perso
        ) VALUES (?, ?, ?, ?)
    `;
    
    const params = [
        telefono.prin_telefono,
        telefono.sec_telefono,
        telefono.cas_telefono,
        telefono.codigo_perso
    ];

    const result = await db.runAsync(sql, params);
    return result;
};

exports.obtenerTelefono = async (cod_telefono) => {
    return await db.getAsync(
        "SELECT * FROM Tb_telefonop WHERE cod_telefono = ?", 
        [cod_telefono]
    );
};

exports.actualizarTelefono = async (cod_telefono, telefono) => {
    const sql = `
        UPDATE Tb_telefonop SET
            prin_telefono = ?,
            sec_telefono = ?,
            cas_telefono = ?,
            codigo_perso = ?
        WHERE cod_telefono = ?
    `;
    
    const params = [
        telefono.prin_telefono,
        telefono.sec_telefono,
        telefono.cas_telefono,
        telefono.codigo_perso,
        cod_telefono
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarTelefono = async (cod_telefono) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_telefonop WHERE cod_telefono = ?",
        [cod_telefono]
    );
    return result.changes;
};

exports.obtenerTelefonosPorPersona = async (codigo_perso) => {
    return await db.allAsync(
        "SELECT * FROM Tb_telefonop WHERE codigo_perso = ?",
        [codigo_perso]
    );
};