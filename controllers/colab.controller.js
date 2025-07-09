const erorManager = require('../js/errorManager.js');
const Colaboracion = require('../models/colab.model.js');
const Estudiante = require('../models/estudiante.model.js');
const Inscripcion = require('../models/studentsection.model.js');

exports.cargarPagina = async (req, res) => {
    try {
        const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
        
        res.render('page-colaboraciones', {
            title: 'Gestión de Colaboraciones',
            colaboraciones: colaboraciones,
            formData: null,
            error: null,
            studentInfo: null
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar colaboraciones', 500);
    }
};

exports.crearColaboracion = async (req, res) => {
    try {
        const { cedula_escolar, fecha_dPagos, monto_dPagoS } = req.body;
        
        // Validar campos obligatorios
        if (!cedula_escolar || !fecha_dPagos || !monto_dPagoS) {
            const error = new Error('Todos los campos son obligatorios');
            error.status = 400;
            throw error;
        }

        // 1. Buscar estudiante por cédula escolar
        const estudiante = await Estudiante.obtenerEstudianteCedula(cedula_escolar);
        if (!estudiante) {
            const error = new Error('No se encontró un estudiante con esa cédula escolar');
            error.status = 404;
            throw error;
        }
        
        // 2. Obtener la última inscripción del estudiante
        const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
        if (!inscripcion) {
            const error = new Error('El estudiante no tiene inscripciones registradas');
            error.status = 404;
            throw error;
        }
        
        // 3. Crear la colaboración usando la última inscripción
        const data = {
            cod_inscripc: inscripcion.cod_inscripc,
            fecha_dPagos,
            monto_dPagoS: parseFloat(monto_dPagoS)
        };
        
        await Colaboracion.crearColaboracion(data);
        res.redirect('/colaboraciones');
    } catch (error) {
        try {
            // Recargar la página con datos ingresados
            const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
            
            // Buscar estudiante nuevamente para mostrar información
            let studentInfo = null;
            if (req.body.cedula_escolar) {
                const estudiante = await Estudiante.obtenerEstudianteCedula(req.body.cedula_escolar);
                if (estudiante) {
                    const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
                    studentInfo = {
                        estudiante,
                        inscripcion
                    };
                }
            }
            
            res.render('page-colaboraciones', {
                title: 'Gestión de Colaboraciones',
                colaboraciones: colaboraciones,
                formData: req.body,
                studentInfo: studentInfo,
                error: 'Error al crear colaboración: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en creación', 500);
        }
    }
};

exports.eliminarColaboracion = async (req, res) => {
    try {
        const cod_colabora = req.params.id;
        
        // Verificar si existe la colaboración
        const colaboracion = await Colaboracion.obtenerColaboracion(cod_colabora);
        if (!colaboracion) {
            const error = new Error('Colaboración no encontrada');
            error.status = 404;
            throw error;
        }

        await Colaboracion.eliminarColaboracion(cod_colabora);
        res.redirect('/colaboraciones');
    } catch (error) {
        try {
            const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
            
            res.render('page-colaboraciones', {
                title: 'Gestión de Colaboraciones',
                colaboraciones: colaboraciones,
                formData: null,
                studentInfo: null,
                error: 'Error al eliminar colaboración: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en eliminación', 500);
        }
    }
};

exports.verificarEstudiante = async (req, res) => {
    try {
        const { cedula_escolar } = req.body;
        
        // Validar cédula escolar
        if (!cedula_escolar) {
            const error = new Error('Debe proporcionar una cédula escolar');
            error.status = 400;
            throw error;
        }

        const estudiante = await Estudiante.obtenerEstudianteCedula(cedula_escolar);
        
        if (!estudiante) {
            const error = new Error('No se encontró un estudiante con esa cédula escolar');
            error.status = 404;
            throw error;
        }
        
        const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
        
        if (!inscripcion) {
            const error = new Error('El estudiante no tiene inscripciones registradas');
            error.status = 404;
            throw error;
        }
        
        const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
        
        res.render('page-colaboraciones', {
            title: 'Gestión de Colaboraciones',
            colaboraciones: colaboraciones,
            formData: req.body,
            studentInfo: {
                estudiante,
                inscripcion
            },
            error: null
        });
    } catch (error) {
        try {
            const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
            
            res.render('page-colaboraciones', {
                title: 'Gestión de Colaboraciones',
                colaboraciones: colaboraciones,
                formData: req.body,
                studentInfo: null,
                error: 'Error al verificar estudiante: ' + error.message
            });
        } catch (innerError) {
            erorManager.handle(innerError, res, 'Error al procesar fallo en verificación', 500);
        }
    }
};