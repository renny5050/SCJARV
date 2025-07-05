// nuPersonaModel.js
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

// Operaciones CRUD para Tb_nupersona (actualizada)
exports.crearPersona = async (persona) => {
    const sql = `
        INSERT INTO Tb_nupersona (
            primer_nombr, segundo_nomb, primer_apell, segund_apell,
            cedula_perso, cedula, fech_nacimie, nacionalidad,
            correo_perso, direcc_perso, status_perso,
            prin_telefono, sec_telefono, cas_telefono,
            estado_civil, ocupacion_p, docente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        persona.primer_nombr,
        persona.segundo_nomb,
        persona.primer_apell,
        persona.segund_apell,
        persona.cedula_perso,
        persona.cedula,
        persona.fech_nacimie,
        persona.nacionalidad,
        persona.correo_perso,
        persona.direcc_perso,
        persona.status_perso ? 1 : 0,  // Convertir boolean a integer
        persona.prin_telefono,
        persona.sec_telefono,
        persona.cas_telefono,
        persona.estado_civil,
        persona.ocupacion_p,
        persona.docente ? 1 : 0  // Convertir boolean a integer
    ];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

exports.obtenerPersona = async (codigo_perso) => {
    const row = await db.getAsync(
        "SELECT * FROM Tb_nupersona WHERE codigo_perso = ?", 
        [codigo_perso]
    );
    
    if (row) {
        // Convertir integer a boolean para campos booleanos
        row.status_perso = row.status_perso === 1;
    }
    
    return row;
};

// Nueva función para buscar persona por cédula
exports.obtenerPersonaPorCedula = async (cedula_perso) => {
    const row = await db.getAsync(
        "SELECT * FROM Tb_nupersona WHERE cedula_perso = ?", 
        [cedula_perso]
    );
    
    if (row) {
        // Convertir integer a boolean para campos booleanos
        row.status_perso = row.status_perso === 1;
    }
    
    return row;
};

exports.actualizarPersona = async (codigo_perso, persona) => {
    const sql = `
        UPDATE Tb_nupersona SET
            primer_nombr = ?,
            segundo_nomb = ?,
            primer_apell = ?,
            segund_apell = ?,
            cedula_perso = ?,
            cedula = ?,
            fech_nacimie = ?,
            nacionalidad = ?,
            correo_perso = ?,
            direcc_perso = ?,
            status_perso = ?,
            prin_telefono = ?,
            sec_telefono = ?,
            cas_telefono = ?
        WHERE codigo_perso = ?
    `;
    
    const params = [
        persona.primer_nombr,
        persona.segundo_nomb,
        persona.primer_apell,
        persona.segund_apell,
        persona.cedula_perso,
        persona.cedula,
        persona.fech_nacimie,
        persona.nacionalidad,
        persona.correo_perso,
        persona.direcc_perso,
        persona.status_perso ? 1 : 0,  // Convertir boolean a integer
        persona.prin_telefono,
        persona.sec_telefono,
        persona.cas_telefono,
        codigo_perso
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarPersona = async (codigo_perso) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_nupersona WHERE codigo_perso = ?",
        [codigo_perso]
    );
    return result.changes;
};

exports.obtenerTodasPersonas = async () => {
    const rows = await db.allAsync("SELECT * FROM Tb_nupersona");
    
    return rows.map(row => ({
        ...row,
        status_perso: row.status_perso === 1  // Convertir integer a boolean
    }));
};