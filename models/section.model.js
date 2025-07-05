// seccionModel.js
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

// Operaciones CRUD para Tb_nuSeccion

/**
 * Crea una nueva sección
 * @param {Object} seccion - Objeto con los datos de la sección
 * @param {string} seccion.nombre_secci - Nombre de la sección
 * @returns {Promise<number>} ID de la nueva sección creada
 */
exports.crearSeccion = async (nombre_secci) => {
    const sql = `INSERT INTO Tb_nuSeccion (nombre_secci) VALUES (?)`;
    const params = [nombre_secci];

    const result = await db.runAsync(sql, params);
    return result.lastID;
};

/**
 * Obtiene una sección por su código
 * @param {number} codigo_secci - Código de la sección
 * @returns {Promise<Object>} Objeto con los datos de la sección
 */
exports.obtenerSeccion = async (codigo_secci) => {
    return await db.getAsync(
        "SELECT * FROM Tb_nuSeccion WHERE codigo_secci = ?", 
        [codigo_secci]
    );
};

/**
 * Actualiza una sección existente
 * @param {number} codigo_secci - Código de la sección a actualizar
 * @param {Object} seccion - Objeto con los nuevos datos de la sección
 * @param {string} seccion.nombre_secci - Nuevo nombre de la sección
 * @returns {Promise<number>} Número de filas afectadas
 */
exports.actualizarSeccion = async (codigo_secci, seccion) => {
    const sql = `
        UPDATE Tb_nuSeccion SET
            nombre_secci = ?
        WHERE codigo_secci = ?
    `;
    
    const params = [
        seccion.nombre_secci,
        codigo_secci
    ];

    const result = await db.runAsync(sql, params);
    return result.changes;
};

/**
 * Elimina una sección
 * @param {number} codigo_secci - Código de la sección a eliminar
 * @returns {Promise<number>} Número de filas afectadas
 */
exports.eliminarSeccion = async (codigo_secci) => {
    const result = await db.runAsync(
        "DELETE FROM Tb_nuSeccion WHERE codigo_secci = ?",
        [codigo_secci]
    );
    return result.changes;
};

/**
 * Obtiene todas las secciones
 * @returns {Promise<Array>} Lista de todas las secciones
 */
exports.obtenerTodasSecciones = async () => {
    return await db.allAsync("SELECT * FROM Tb_nuSeccion ORDER BY nombre_secci");
};

/**
 * Busca secciones por nombre
 * @param {string} nombre - Nombre o parte del nombre a buscar
 * @returns {Promise<Array>} Lista de secciones que coinciden con la búsqueda
 */
exports.buscarSeccionesPorNombre = async (nombre) => {
    return await db.allAsync(
        "SELECT * FROM Tb_nuSeccion WHERE nombre_secci LIKE ? ORDER BY nombre_secci",
        [`%${nombre}%`]
    );
};