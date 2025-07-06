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
        console.error('Error al cargar colaboraciones:', error);
        res.status(500).send('Error al cargar colaboraciones');
    }
};

exports.crearColaboracion = async (req, res) => {
    try {
        const { cedula_escolar, fecha_dPagos, monto_dPagoS } = req.body;
        
        // 1. Buscar estudiante por cédula escolar
        const estudiante = await Estudiante.obtenerEstudianteCedula(cedula_escolar);
        if (!estudiante) {
            throw new Error('No se encontró un estudiante con esa cédula escolar');
        }
        
        // 2. Obtener la última inscripción del estudiante
        const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
        if (!inscripcion) {
            throw new Error('El estudiante no tiene inscripciones registradas');
        }
        
        // 3. Crear la colaboración usando la última inscripción
        const data = {
            cod_inscripc: inscripcion.cod_inscripc,
            fecha_dPagos,
            monto_dPagoS
        };
        
        await Colaboracion.crearColaboracion(data);
        res.redirect('/colaboraciones');
    } catch (error) {
        console.error('Error al crear colaboración:', error);
        // Recargar la página con datos ingresados
        const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
        
        // Buscar estudiante nuevamente para mostrar información
        let studentInfo = null;
        if (req.body.cedula_escolar) {
            try {
                const estudiante = await Estudiante.obtenerEstudianteCedula(req.body.cedula_escolar);
                if (estudiante) {
                    const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
                    studentInfo = {
                        estudiante,
                        inscripcion
                    };
                }
            } catch (e) {
                console.log('No se pudo obtener información del estudiante', e);
            }
        }
        
        res.render('page-colaboraciones', {
            title: 'Gestión de Colaboraciones',
            colaboraciones: colaboraciones,
            formData: req.body,
            studentInfo: studentInfo,
            error: 'Error al crear colaboración: ' + error.message
        });
    }
};

exports.eliminarColaboracion = async (req, res) => {
    try {
        const cod_colabora = req.params.id;
        await Colaboracion.eliminarColaboracion(cod_colabora);
        res.redirect('/colaboraciones');
    } catch (error) {
        console.error('Error al eliminar colaboración:', error);
        const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
        
        res.render('page-colaboraciones', {
            title: 'Gestión de Colaboraciones',
            colaboraciones: colaboraciones,
            formData: null,
            studentInfo: null,
            error: 'Error al eliminar colaboración: ' + error.message
        });
    }
};

exports.verificarEstudiante = async (req, res) => {
    try {
        const { cedula_escolar } = req.body;
        const estudiante = await Estudiante.obtenerEstudianteCedula(cedula_escolar);
        
        if (!estudiante) {
            throw new Error('No se encontró un estudiante con esa cédula escolar');
        }
        
        const inscripcion = await Inscripcion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud);
        
        if (!inscripcion) {
            throw new Error('El estudiante no tiene inscripciones registradas');
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
        const colaboraciones = await Colaboracion.obtenerColaboracionesConDetalles();
        
        res.render('page-colaboraciones', {
            title: 'Gestión de Colaboraciones',
            colaboraciones: colaboraciones,
            formData: req.body,
            studentInfo: null,
            error: 'Error al verificar estudiante: ' + error.message
        });
    }
};