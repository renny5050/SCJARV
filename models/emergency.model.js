// contactoEmergenciaModel.js
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

// Operaciones CRUD para Tb_cont_emer
exports.crearContactoEmergencia = async (contacto) => {
    const sql = `
        INSERT INTO Tb_cont_emer (codigo_perso, parentesco_e)
        VALUES (?, ?)
    `;
    
    const params = [contacto.codigo_perso, contacto.parentesco_e];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerContactoEmergencia = async (cod_contEmer) => {
    return await db.getAsync(
        "SELECT * FROM Tb_cont_emer WHERE cod_contEmer = ?", 
        [cod_contEmer]
    );
};

exports.actualizarContactoEmergencia = async (cod_contEmer, contacto) => {
    const sql = `
        UPDATE Tb_cont_emer SET
            codigo_perso = ?,
            parentesco_e = ?
        WHERE cod_contEmer = ?
    `;
    
    const params = [
        contacto.codigo_perso,
        contacto.parentesco_e,
        cod_contEmer
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarContactoEmergencia = async (cod_contEmer) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_cont_emer WHERE cod_contEmer = ?",
        [cod_contEmer]
    );
    return result.changes;
};

exports.obtenerTodosContactosEmergencia = async () => {
    return await db.allAsync("SELECT * FROM Tb_cont_emer");
};