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

// Crear colaboración
exports.crearColaboracion = async (colaboracion) => {
    const sql = `INSERT INTO Tb_colaborac (cod_inscripc, fecha_dPagos, monto_dPagoS) VALUES (?, ?, ?)`;
    const params = [colaboracion.cod_inscripc, colaboracion.fecha_dPagos, colaboracion.monto_dPagoS];
    const result = await db.runAsync(sql, params);
    return result.lastID;
};

// Eliminar colaboración
exports.eliminarColaboracion = async (cod_colabora) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_colaborac WHERE cod_colabora = ?",
        [cod_colabora]
    );
    return result.changes;
};

exports.obtenerColaboracionesConDetalles = async () => {
    const sql = `
        SELECT 
            c.cod_colabora,
            c.fecha_dPagos,
            CAST(c.monto_dPagoS AS REAL) as monto_dPagoS,
            e.primer_nombr || ' ' || e.primer_apell as nombre_estudiante,
            e.cedu_escolar,
            s.nombre_secci as seccion
        FROM Tb_colaborac c
        JOIN Tb_inscripci i ON c.cod_inscripc = i.cod_inscripc
        JOIN Tb_estudiant e ON i.codigo_estud = e.codigo_estud
        JOIN Tb_anoSeccio a ON i.cod_anoSecci = a.cod_anoSecci
        JOIN Tb_nuSeccion s ON a.codigo_secci = s.codigo_secci
    `;
    
    return await db.allAsync(sql);
};