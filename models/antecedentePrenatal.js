// antePrenModel.js
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

// Operaciones CRUD para Tb_ante_pren
exports.crearAntePren = async (registro) => {
    const sql = `
        INSERT INTO Tb_ante_pren (
            enfe_madreEm, cod_codiPart, edad_maParto,
            peso_ninoNac, tall_ninoNac, medi_contPre
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        registro.enfe_madreEm,
        registro.cod_codiPart,
        registro.edad_maParto,
        registro.peso_ninoNac,
        registro.tall_ninoNac,
        registro.medi_contPre
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerAntePren = async (cod_antePren) => {
    return await db.getAsync(
        "SELECT * FROM Tb_ante_pren WHERE cod_antePren = ?", 
        [cod_antePren]
    );
};

exports.actualizarAntePren = async (cod_antePren, registro) => {
    const sql = `
        UPDATE Tb_ante_pren SET
            enfe_madreEm = ?,
            cod_codiPart = ?,
            edad_maParto = ?,
            peso_ninoNac = ?,
            tall_ninoNac = ?,
            medi_contPre = ?
        WHERE cod_antePren = ?
    `;
    
    const params = [
        registro.enfe_madreEm,
        registro.cod_codiPart,
        registro.edad_maParto,
        registro.peso_ninoNac,
        registro.tall_ninoNac,
        registro.medi_contPre,
        cod_antePren
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarAntePren = async (cod_antePren) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_ante_pren WHERE cod_antePren = ?",
        [cod_antePren]
    );
    return result.changes;
};

exports.obtenerTodosAntePren = async () => {
    return await db.allAsync("SELECT * FROM Tb_ante_pren");
};