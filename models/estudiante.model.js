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

// Operaciones CRUD
exports.crearEstudiante = async (estudiante) => {

    

    const sql = `
        INSERT INTO Tb_estudiant (
            primer_nombr, segundo_nomb, primer_apell, segundo_apellido,
            fecha_nacimiento, sexo, nacionalidad, tip_sangrees, grupo_sangui,
            estad_nacimi, munic_nacimi, cedu_escolar, status_estud, peso_kg, tall_cm, fecha_inscripcion,
            codigo_repre, codigo_padre, codigo_madre, cod_contEmer, cod_amSocFam,
            cod_antePren, cod_probNace
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        estudiante.primer_nombr,
        estudiante.segundo_nomb,
        estudiante.primer_apell,
        estudiante.segundo_apellido,
        estudiante.fecha_nacimiento,
        estudiante.sexo,
        estudiante.nacionalidad,
        estudiante.tip_sangrees ? 1 : 0,
        estudiante.grupo_sangui,
        estudiante.estad_nacimi,
        estudiante.munic_nacimi,
        estudiante.cedu_escolar,
        estudiante.status_estud ? 1 : 0,
        estudiante.peso_kg,
        estudiante.tall_cm,
        estudiante.fecha_inscripcion,
        estudiante.codigo_repre,
        estudiante.codigo_padre,
        estudiante.codigo_madre,
        estudiante.cod_contEmer,
        estudiante.cod_amSocFam,
        estudiante.cod_antePren,
        estudiante.cod_probNace
    ];

    const result = await db.runAsync(sql, params);
    
    return result;
};

exports.obtenerEstudiante = async (codigo_estud) => {
    
    const row = await db.getAsync(
        "SELECT * FROM Tb_estudiant WHERE codigo_estud = ?", 
        [codigo_estud]
    );
    
    


    if (row) {
        row.tip_sangrees = row.tip_sangrees === 1;
        row.status_estud = row.status_estud === 1;
    }
    
    return row;
};

exports.obtenerEstudianteCedula = async (cedu_escolar) => {
    const row = await db.getAsync(
        "SELECT * FROM Tb_estudiant WHERE cedu_escolar = ?", 
        [cedu_escolar]
    );
    
    if (row) {
        row.tip_sangrees = row.tip_sangrees === 1;
        row.status_estud = row.status_estud === 1;
    }
    
    return row;
};

exports.actualizarEstudiante = async (codigo_estud, estudiante) => {
    const sql = `
        UPDATE Tb_estudiant SET
            primer_nombr = ?,
            segundo_nomb = ?,
            primer_apell = ?,
            segundo_apellido = ?,
            fecha_nacimiento = ?,
            sexo = ?,
            nacionalidad = ?,
            tip_sangrees = ?,
            grupo_sangui = ?,
            estad_nacimi = ?,
            munic_nacimi = ?,
            cedu_escolar = ?,
            status_estud = ?,
            codigo_repre = ?,
            codigo_padre = ?,
            codigo_madre = ?,
            cod_contEmer = ?,
            cod_amSocFam = ?,
            cod_antePren = ?,
            cod_probNace = ?
        WHERE codigo_estud = ?
    `;
    
    const params = [
        estudiante.primer_nombr,
        estudiante.segundo_nomb,
        estudiante.primer_apell,
        estudiante.segundo_apellido,
        estudiante.fecha_nacimiento,
        estudiante.sexo,
        estudiante.nacionalidad,
        estudiante.tip_sangrees ? 1 : 0,
        estudiante.grupo_sangui,
        estudiante.estad_nacimi,
        estudiante.munic_nacimi,
        estudiante.cedu_escolar,
        estudiante.status_estud ? 1 : 0,
        estudiante.codigo_repre,
        estudiante.codigo_padre,
        estudiante.codigo_madre,
        estudiante.cod_contEmer,
        estudiante.cod_amSocFam,
        estudiante.cod_antePren,
        estudiante.cod_probNace,
        codigo_estud
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

exports.eliminarEstudiante = async (codigo_estud) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_estudiant WHERE codigo_estud = ?",
        [codigo_estud]
    );
    return result.changes;
};

exports.obtenerTodosEstudiantes = async () => {
    const rows = await db.allAsync("SELECT * FROM Tb_estudiant");
    
    return rows.map(row => ({
        ...row,
        tip_sangrees: row.tip_sangrees === 1,
        status_estud: row.status_estud === 1
    }));
};

// Agregar esta función al final del modelo
exports.obtenerEstudiantesPorRepresentanteYAnio = async (codigo_repre, anio) => {
    const sql = `
        SELECT * 
        FROM Tb_estudiant 
        WHERE codigo_repre = ? 
        AND strftime('%Y', fecha_nacimiento) = ?
    `;
    const params = [codigo_repre, anio.toString()];
    const rows = await db.allAsync(sql, params);
    
    return rows.map(row => ({
        ...row,
        tip_sangrees: row.tip_sangrees === 1,
        status_estud: row.status_estud === 1
    }));
};
