const erorManager = require('../js/errorManager.js');
const nuPersonaModel = require('../models/persona.model.js');

// Listar todos los docentes
exports.listarDocentes = async (req, res) => {
    try {
        const docentesData = await nuPersonaModel.obtenerTodasPersonas();
        // Filtrar solo los docentes
        const docentes = docentesData.filter(docente => docente.docente === 1);

        res.render('page-docentes', {
            title: 'Gestión de Docentes',
            docentes: docentes,
            formData: null,
            error: null
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al listar docentes', 500);
    }
};

// Crear un nuevo docente
exports.crearDocente = async (req, res) => {
    try {
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

        // Validación de campos obligatorios
        if (!persona.primer_nombr || !persona.primer_apell || !persona.cedula_perso) {
            const error = new Error('Nombre, apellido y cédula son campos obligatorios');
            error.status = 400;
            throw error;
        }

        await nuPersonaModel.crearPersona(persona);
        res.redirect('/docentes');
    } catch (error) {
        try {
            // Recargar la lista de docentes con los datos ingresados
            const docentesData = await nuPersonaModel.obtenerTodasPersonas();
            const docentes = docentesData.filter(docente => docente.docente === 1);

            res.render('page-docentes', {
                title: 'Gestión de Docentes',
                docentes: docentes,
                formData: req.body,
                error: 'Error al crear docente: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en creación', 500);
        }
    }
};

// Actualizar un docente existente
exports.actualizarDocente = async (req, res) => {
    try {
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
            ocupacion_p: req.body.ocupacion_p || 'Docente'
        };

        // Validación de campos obligatorios
        if (!persona.primer_nombr || !persona.primer_apell || !persona.cedula_perso) {
            const error = new Error('Nombre, apellido y cédula son campos obligatorios');
            error.status = 400;
            throw error;
        }

        // Verificar si el docente existe
        const docenteExistente = await nuPersonaModel.obtenerPersona(codigo_perso);
        if (!docenteExistente || docenteExistente.docente !== 1) {
            const error = new Error('Docente no encontrado');
            error.status = 404;
            throw error;
        }

        await nuPersonaModel.actualizarPersona(codigo_perso, persona);
        res.redirect('/docentes');
    } catch (error) {
        try {
            // Recargar la lista de docentes
            const docentesData = await nuPersonaModel.obtenerTodasPersonas();
            const docentes = docentesData.filter(docente => docente.docente === 1);

            res.render('page-docentes', {
                title: 'Gestión de Docentes',
                docentes: docentes,
                formData: req.body,
                error: 'Error al actualizar docente: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en actualización', 500);
        }
    }
};

// Eliminar un docente
exports.eliminarDocente = async (req, res) => {
    try {
        const codigo_perso = req.params.id;

        // Verificar si el docente existe
        const docenteExistente = await nuPersonaModel.obtenerPersona(codigo_perso);
        if (!docenteExistente || docenteExistente.docente !== 1) {
            const error = new Error('Docente no encontrado');
            error.status = 404;
            throw error;
        }

        await nuPersonaModel.eliminarPersona(codigo_perso);
        res.redirect('/docentes');
    } catch (error) {
        try {
            // Recargar la lista de docentes
            const docentesData = await nuPersonaModel.obtenerTodasPersonas();
            const docentes = docentesData.filter(docente => docente.docente === 1);

            res.render('page-docentes', {
                title: 'Gestión de Docentes',
                docentes: docentes,
                formData: null,
                error: 'Error al eliminar docente: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en eliminación', 500);
        }
    }
};