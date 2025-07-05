// models/colaboracion.model.js
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath);

// Convertir métodos a promesas
db.runAsync = function(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
};
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// Operaciones CRUD para Tb_colaborac
exports.crearColaboracion = async (colaboracion) => {
    const sql = `
        INSERT INTO Tb_colaborac (
            cod_inscripc, fecha_dPagos, monto_dPagoS
        ) VALUES (?, ?, ?)
    `;
    
    const params = [
        colaboracion.cod_inscripc,
        colaboracion.fecha_dPagos,
        colaboracion.monto_dPagoS
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerColaboracion = async (cod_colabora) => {
    return await db.getAsync(
        "SELECT * FROM Tb_colaborac WHERE cod_colabora = ?", 
        [cod_colabora]
    );
};

exports.actualizarColaboracion = async (cod_colabora, colaboracion) => {
    const sql = `
        UPDATE Tb_colaborac SET
            cod_inscripc = ?,
            fecha_dPagos = ?,
            monto_dPagoS = ?
        WHERE cod_colabora = ?
    `;
    
    const params = [
        colaboracion.cod_inscripc,
        colaboracion.fecha_dPagos,
        colaboracion.monto_dPagoS,
        cod_colabora
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarColaboracion = async (cod_colabora) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_colaborac WHERE cod_colabora = ?",
        [cod_colabora]
    );
    return result.changes;
};

exports.obtenerTodasColaboraciones = async () => {
    return await db.allAsync("SELECT * FROM Tb_colaborac");
};

exports.obtenerColaboracionesConDetalles = async () => {
    return await db.allAsync(`
        SELECT 
            c.cod_colabora,
            c.cod_inscripc,
            c.fecha_dPagos,
            c.monto_dPagoS,
            e.primer_nombr || ' ' || COALESCE(e.segundo_nomb, '') || ' ' || 
            e.primer_apell || ' ' || COALESCE(e.segundo_apellido, '') AS nombre_estudiante,
            ns.nombre_secci AS seccion
        FROM Tb_colaborac c
        JOIN Tb_inscripci i ON c.cod_inscripc = i.cod_inscripc
        JOIN Tb_estudiant e ON i.codigo_estud = e.codigo_estud
        JOIN Tb_anoSeccio a ON i.cod_anoSecci = a.cod_anoSecci
        JOIN Tb_nuSeccion ns ON a.codigo_secci = ns.codigo_secci
    `);
};

// Nuevo método para obtener inscripciones con detalles
exports.obtenerInscripcionesConDetalles = async () => {
    return await db.allAsync(`
        SELECT 
            i.cod_inscripc,
            e.primer_nombr || ' ' || COALESCE(e.segundo_nomb, '') || ' ' || 
            e.primer_apell || ' ' || COALESCE(e.segundo_apellido, '') AS nombre_estudiante,
            ns.nombre_secci AS seccion
        FROM Tb_inscripci i
        JOIN Tb_estudiant e ON i.codigo_estud = e.codigo_estud
        JOIN Tb_anoSeccio a ON i.cod_anoSecci = a.cod_anoSecci
        JOIN Tb_nuSeccion ns ON a.codigo_secci = ns.codigo_secci
    `);
};

// Método para iniciar una transacción
exports.beginTransaction = () => {
    return new Promise((resolve, reject) => {
        db.run("BEGIN TRANSACTION", (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Método para hacer commit de una transacción
exports.commitTransaction = () => {
    return new Promise((resolve, reject) => {
        db.run("COMMIT", (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Método para hacer rollback de una transacción
exports.rollbackTransaction = () => {
    return new Promise((resolve, reject) => {
        db.run("ROLLBACK", (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};