const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath);

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


exports.crearInscripcion = async (inscripcion) => {
    const sql = `INSERT INTO Tb_inscripci (cod_anoSecci, codigo_estud) VALUES (?, ?)`;
    const params = [inscripcion.cod_anoSecci, inscripcion.codigo_estud];
    const result = await db.runAsync(sql, params);
    return result.lastID;
};


exports.obtenerInscripcionesPorAnoSeccion = async (cod_anoSecci) => {
    return await db.allAsync(
        `SELECT 
            Tb_estudiant.* 
        FROM 
            Tb_inscripci
        INNER JOIN 
            Tb_estudiant 
        ON 
            Tb_inscripci.codigo_estud = Tb_estudiant.codigo_estud
        WHERE 
            Tb_inscripci.cod_anoSecci = ?`,
        [cod_anoSecci]
    );
};


exports.eliminarInscripcion = async (cod_inscripc) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_inscripci WHERE cod_inscripc = ?",
        [cod_inscripc]
    );
    return result.changes;
};


exports.existeInscripcion = async (cod_anoSecci, codigo_estud) => {
    const inscripcion = await db.getAsync(
        "SELECT 1 FROM Tb_inscripci WHERE cod_anoSecci = ? AND codigo_estud = ?",
        [cod_anoSecci, codigo_estud]
    );
    return !!inscripcion;
};


exports.obtenerEstudiantesInscritos = async (cod_anoSecci) => {
    return await db.allAsync(`
        SELECT e.* 
        FROM Tb_inscripci i
        JOIN Tb_estudiant e ON i.codigo_estud = e.codigo_estud
        WHERE i.cod_anoSecci = ?
    `, [cod_anoSecci]);
};


exports.obtenerEstudiantesNoInscritos = async (cod_anoSecci) => {
    return await db.allAsync(`
        SELECT e.* 
        FROM Tb_estudiant e
        WHERE e.codigo_estud NOT IN (
            SELECT codigo_estud 
            FROM Tb_inscripci 
            WHERE cod_anoSecci = ?
        )
    `, [cod_anoSecci]);
};

exports.obtenerUltimaInscripcionPorEstudiante = async (codigo_estud) => {
    return await db.getAsync(
        `SELECT * FROM Tb_inscripci 
         WHERE codigo_estud = ? 
         ORDER BY cod_inscripc DESC 
         LIMIT 1`,
        [codigo_estud]
    );
};