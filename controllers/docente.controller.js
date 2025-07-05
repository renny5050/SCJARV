// docenteController.js
const doc = require('pdfkit');
const nuPersonaModel = require('../models/persona.model.js');

// Listar todos los docentes
exports.listarDocentes = async (req, res) => {
    try {
        const docentesData = await nuPersonaModel.obtenerTodasPersonas();
        // Filtrar solo los docentes
        const docentes = docentesData.filter(docente => docente.docente === 1);

        res.render('page-docentes', {
            title: 'Gestión de Docentes',
            docentes: docentes
        });
    } catch (error) {
        console.error('Error al listar docentes:', error);
        res.redirect('/docentes');
    }
};

// Crear un nuevo docente
exports.crearDocente = async (req, res) => {
    const persona = {
        primer_nombr: req.body.primer_nombr,
        segundo_nomb: req.body.segundo_nomb,
        primer_apell: req.body.primer_apell,
        segund_apell: req.body.segund_apell,
        cedula_perso: req.body.cedula_perso,
        cedula: req.body.cedula,
        fech_nacimie: req.body.fech_nacimie,
        nacionalidad: req.body.nacionalidad,
        correo_perso: req.body.correo_perso,
        direcc_perso: req.body.direcc_perso,
        status_perso: req.body.status_perso ? 1 : 0,
        prin_telefono: req.body.prin_telefono,
        sec_telefono: req.body.sec_telefono,
        cas_telefono: req.body.cas_telefono,
        estado_civil: req.body.estado_civil,
        ocupacion_p: req.body.ocupacion_p || 'Docente', // Valor por defecto
        docente: 1 // Marcar como docente
    };

    // Validación básica
    if (!persona.primer_nombr || !persona.primer_apell || !persona.cedula_perso) {
        return res.redirect('/docentes');
    }

    try {
        await nuPersonaModel.crearPersona(persona);
        res.redirect('/docentes');
    } catch (error) {
        console.error('Error al crear docente:', error);
        res.redirect('/docentes');
    }
};
// Actualizar un docente existente
exports.actualizarDocente = async (req, res) => {
    const codigo_perso = req.params.id;
    const persona = {
        primer_nombr: req.body.primer_nombr,
        segundo_nomb: req.body.segundo_nomb,
        primer_apell: req.body.primer_apell,
        segund_apell: req.body.segund_apell,
        cedula_perso: req.body.cedula_perso,
        cedula: req.body.cedula,
        fech_nacimie: req.body.fech_nacimie,
        nacionalidad: req.body.nacionalidad,
        correo_perso: req.body.correo_perso,
        direcc_perso: req.body.direcc_perso,
        status_perso: req.body.status_perso ? 1 : 0,
        prin_telefono: req.body.prin_telefono,
        sec_telefono: req.body.sec_telefono,
        cas_telefono: req.body.cas_telefono,
        estado_civil: req.body.estado_civil,
        ocupacion_p: req.body.ocupacion_p
    };

    try {
        await nuPersonaModel.actualizarPersona(codigo_perso, persona);
        res.redirect('/docentes');
    } catch (error) {
        console.error('Error al actualizar docente:', error);
        res.redirect('/docentes');
    }
};

// Eliminar un docente
exports.eliminarDocente = async (req, res) => {
    const codigo_perso = req.params.id;

    try {
        await nuPersonaModel.eliminarPersona(codigo_perso);
        res.redirect('/docentes');
    } catch (error) {
        console.error('Error al eliminar docente:', error);
        res.redirect('/docentes');
    }
};