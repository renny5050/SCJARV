// problNacModel.js
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

// Operaciones CRUD para Tb_probl_nac
exports.crearProblNac = async (registro) => {
    const sql = `
        INSERT INTO Tb_probl_nac (
            edad_caminar, edad_nhablar, mano_dominan, cod_enfePade
        ) VALUES (?, ?, ?, ?)
    `;
    
    const params = [
        registro.edad_caminar,
        registro.edad_nhablar,
        registro.mano_dominan,
        registro.cod_enfePade
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerProblNac = async (cod_probNace) => {
    return await db.getAsync(
        "SELECT * FROM Tb_probl_nac WHERE cod_probNace = ?", 
        [cod_probNace]
    );
};

exports.actualizarProblNac = async (cod_probNace, registro) => {
    const sql = `
        UPDATE Tb_probl_nac SET
            edad_caminar = ?,
            edad_nhablar = ?,
            mano_dominan = ?,
            cod_enfePade = ?
        WHERE cod_probNace = ?
    `;
    
    const params = [
        registro.edad_caminar,
        registro.edad_nhablar,
        registro.mano_dominan,
        registro.cod_enfePade,
        cod_probNace
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarProblNac = async (cod_probNace) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_probl_nac WHERE cod_probNace = ?",
        [cod_probNace]
    );
    return result.changes;
};

exports.obtenerTodosProblNac = async () => {
    return await db.allAsync("SELECT * FROM Tb_probl_nac");
};