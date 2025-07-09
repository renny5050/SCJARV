const erorManager = require('../js/errorManager.js');
const studentModel = require('../models/estudiante.model.js');
const anioSeccionModel = require('../models/anioSeccion.model.js');
const studentSectionModel = require('../models/studentsection.model.js');
const Persona = require('../models/persona.model.js');

exports.mostrarInscripciones = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        
        // Validar ID de año-sección
        if (!cod_anoSecci || isNaN(cod_anoSecci)) {
            const error = new Error('ID de año-sección inválido');
            error.status = 400;
            throw error;
        }

        // Obtener estudiantes inscritos
        const estudiantes = await studentSectionModel.obtenerInscripcionesPorAnoSeccion(cod_anoSecci);
        
        // Obtener información de la sección
        const dataSeccion = await anioSeccionModel.obtenerAnoSeccion(cod_anoSecci);
        if (!dataSeccion) {
            const error = new Error('Sección no encontrada');
            error.status = 404;
            throw error;
        }
        
        // Obtener docentes
        const docentePrincipal = await Persona.obtenerPersona(dataSeccion.docente_prin);
        const docenteSecundario = await Persona.obtenerPersona(dataSeccion.docente_secu);

        // Formatear datos de estudiantes
        const estudiantesFormateados = estudiantes.map(est => ({
            ...est,
            nombreCompleto: `${est.primer_nombr} ${est.segundo_nomb || ''} ${est.primer_apell} ${est.segundo_apellido || ''}`,
            estado: est.status_estud === 1 ? 'Activo' : 'Inactivo',
            fechaNac: new Date(est.fecha_nacimiento).toLocaleDateString('es-ES'),
            tieneTipoSangre: est.tip_sangrees === 1 ? 'Sí' : 'No'
        }));

        res.render('page-cursantes', {
            title: 'Estudiantes Inscritos',
            estudiantes: estudiantesFormateados,
            cod_anoSecci: cod_anoSecci,
            docente_prin: docentePrincipal,
            docente_secu: docenteSecundario
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al mostrar inscripciones', error.status || 500);
    }
};

const inscribirEstudianteInterno = async (cod_anoSecci, cedu_escolar, res) => {
    try {
        // Validar parámetros
        if (!cod_anoSecci || !cedu_escolar) {
            const error = new Error('Parámetros requeridos faltantes');
            error.status = 400;
            throw error;
        }

        // Buscar estudiante
        const estudiante = await studentModel.obtenerEstudianteCedula(cedu_escolar);
        if (!estudiante) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        // Verificar si ya está inscrito
        const existeInscripcion = await studentSectionModel.existeInscripcion(cod_anoSecci, estudiante.codigo_estud);
        if (existeInscripcion) {
            const error = new Error('El estudiante ya está inscrito en esta sección');
            error.status = 400;
            throw error;
        }

        // Crear inscripción
        const inscripcion = await studentSectionModel.crearInscripcion({
            cod_anoSecci: cod_anoSecci,
            codigo_estud: estudiante.codigo_estud
        });

        if (!inscripcion) {
            const error = new Error('Error al inscribir al estudiante');
            error.status = 500;
            throw error;
        }

        return inscripcion;
    } catch (error) {
        throw error;
    }
};

exports.inscribirEstudiante = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        const cedu_escolar = req.body.cedu_escolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.inscribirEstudianteEnlace = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        const cedu_escolar = req.params.cedulaEscolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.inscribirEstudianteRedireccion = async (req, res) => {
    try {
        const cod_anoSecci = req.body.cod_anoSecci;
        const cedu_escolar = req.body.cedu_escolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.eliminarInscripcion = async (req, res) => {
    try {
        const cod_inscripc = req.params.id;
        
        // Validar ID de inscripción
        if (!cod_inscripc || isNaN(cod_inscripc)) {
            const error = new Error('ID de inscripción inválido');
            error.status = 400;
            throw error;
        }

        // Verificar si existe la inscripción
        const inscripcion = await studentSectionModel.obtenerInscripcion(cod_inscripc);
        if (!inscripcion) {
            const error = new Error('Inscripción no encontrada');
            error.status = 404;
            throw error;
        }

        // Eliminar inscripción
        await studentSectionModel.eliminarInscripcion(cod_inscripc);
        res.redirect('back');
    } catch (error) {
        erorManager.handle(error, res, 'Error al eliminar inscripción', error.status || 500);
    }
};