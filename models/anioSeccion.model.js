const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
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
                changes: this.changes    // Número de filas afectadas
            });
        });
    });
};
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);
// Operaciones CRUD para Tb_anoSeccio

exports.crearAnoSeccion = async (asignacion) => {
    const sql = `INSERT INTO Tb_anoSeccio (ano_Seccione, codigo_secci, docente_prin, docente_secu) VALUES (?, ?, ?, ?)`;
    const params = [asignacion.ano_Seccione, asignacion.codigo_secci, asignacion.docente_prin, asignacion.docente_secu];
    const result = await db.runAsync(sql, params);
    return result.lastID;
};


exports.obtenerAnoSeccion = async (cod_anoSecci) => {
    return await db.getAsync(
        "SELECT * FROM Tb_anoSeccio WHERE cod_anoSecci = ?",
        [cod_anoSecci]
    );
};


exports.actualizarAnoSeccion = async (cod_anoSecci, asignacion) => {
    const sql = `
        UPDATE Tb_anoSeccio SET
            ano_Seccione = ?,
            codigo_secci = ?
        WHERE cod_anoSecci = ?
    `;
    const params = [
        asignacion.ano_Seccione,
        asignacion.codigo_secci,
        cod_anoSecci
    ];
    const result = await db.runAsync(sql, params);
    return result.changes;
};


exports.eliminarAnoSeccion = async (cod_anoSecci) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_anoSeccio WHERE cod_anoSecci = ?",
        [cod_anoSecci]
    );
    return result.changes;
};


exports.obtenerTodasAnoSecciones = async () => {
    return await db.allAsync("SELECT * FROM Tb_anoSeccio");
};


exports.obtenerAnoSeccionesPorSeccion = async (codigo_secci) => {
    return await db.allAsync(
        "SELECT * FROM Tb_anoSeccio WHERE codigo_secci = ?",
        [codigo_secci]
    );
};


exports.obtenerAnoSeccionesPorAno = async (ano_Seccione) => {
    return await db.allAsync(
        "SELECT * FROM Tb_anoSeccio WHERE ano_Seccione = ?",
        [ano_Seccione]
    );
};


exports.existeAsignacion = async (ano_Seccione, codigo_secci) => {
    const asignacion = await db.getAsync(
        "SELECT 1 FROM Tb_anoSeccio WHERE ano_Seccione = ? AND codigo_secci = ?",
        [ano_Seccione, codigo_secci]
    );
    return !!asignacion;
};