// amSocFamModel.js
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

// Operaciones CRUD para Tb_am_so_fam
exports.crearAmSocFam = async (registro) => {
    const sql = `
        INSERT INTO Tb_am_so_fam (
            pers_amSoFam, numero_ninos, nume_adultos,
            tip_caracter, tip_tenencia
        ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
        registro.pers_amSoFam,
        registro.numero_ninos,
        registro.nume_adultos,
        registro.tip_caracter,
        registro.tip_tenencia
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerAmSocFam = async (cod_amSocFam) => {
    return await db.getAsync(
        "SELECT * FROM Tb_am_so_fam WHERE cod_amSocFam = ?", 
        [cod_amSocFam]
    );
};

exports.actualizarAmSocFam = async (cod_amSocFam, registro) => {
    const sql = `
        UPDATE Tb_am_so_fam SET
            pers_amSoFam = ?,
            numero_ninos = ?,
            nume_adultos = ?,
            tip_caracter = ?,
            tip_tenencia = ?
        WHERE cod_amSocFam = ?
    `;
    
    const params = [
        registro.pers_amSoFam,
        registro.numero_ninos,
        registro.nume_adultos,
        registro.tip_caracter,
        registro.tip_tenencia,
        cod_amSocFam
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarAmSocFam = async (cod_amSocFam) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_am_so_fam WHERE cod_amSocFam = ?",
        [cod_amSocFam]
    );
    return result.changes;
};

exports.obtenerTodosAmSocFam = async () => {
    return await db.allAsync("SELECT * FROM Tb_am_so_fam");
};