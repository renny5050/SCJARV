// inscripcionController.js
const studentModel = require('../models/estudiante.model.js');
const sectionYearModel = require('../models/anioSeccion.model.js');
const studentSectionModel = require('../models/studentsection.model.js');
const anioSeccionModel = require('../models/anioSeccion.model.js');
const Persona = require('../models/persona.model.js'); // Asegúrate de importar el modelo de personas



exports.mostrarInscripciones = async (req, res) => {
    const cod_anoSecci = req.params.id; 
    console.log('Código de Año-Sección:', cod_anoSecci);
    
    try {
        const estudiantes = await studentSectionModel.obtenerInscripcionesPorAnoSeccion(cod_anoSecci);  
        const dataSeccion = await anioSeccionModel.obtenerAnoSeccion(cod_anoSecci);
        const docentePrincipal = await Persona.obtenerPersona(dataSeccion.docente_prin);
        const docenteSecundario = await Persona.obtenerPersona(dataSeccion.docente_secu);   

        // Formatear datos importantes
        const estudiantesFormateados = estudiantes.map(est => ({
            ...est,
            nombreCompleto: `${est.primer_nombr} ${est.segundo_nomb || ''} ${est.primer_apell} ${est.segundo_apellido || ''}`,
            estado: est.status_estud === 1 ? 'Activo' : 'Inactivo',
            fechaNac: new Date(est.fecha_nacimiento).toLocaleDateString('es-ES'),
            tieneTipoSangre: est.tip_sangrees === 1 ? 'Sí' : 'No'
        }));

        console.log('Estudiantes Inscritos:', estudiantesFormateados);

        res.render('page-cursantes', {
            title: 'Estudiantes Inscritos',
            estudiantes: estudiantesFormateados,
            cod_anoSecci: cod_anoSecci,
            docente_prin: docentePrincipal,
            docente_secu: docenteSecundario,

        });
        
    } catch (error) {
        console.error('Error al mostrar inscripciones:', error);
        res.status(500).send('Error interno del servidor');
    }
};


exports.inscribirEstudiante = async (req, res) => {
    const { cod_anoSecci, cedu_escolar } = req.body;
    
    try {
        const estudiante = await studentModel.obtenerEstudianteCedula(cedu_escolar);
        const codigo_estud = estudiante ? estudiante.codigo_estud : null;

        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const existeInscripcion = await studentSectionModel.existeInscripcion(cod_anoSecci, codigo_estud);

        if (existeInscripcion) {
            return res.status(400).send('El estudiante ya está inscrito en esta sección');
        }

        const inscripcion = await studentSectionModel.crearInscripcion({
            cod_anoSecci: cod_anoSecci,
            codigo_estud: codigo_estud
        });

        
        if (!inscripcion) {
            return res.status(500).send('Error al inscribir al estudiante');
        }

        res.redirect('/cursantes/' + cod_anoSecci);

    } catch (error) {
        console.error('Error al inscribir estudiante:', error);
        res.redirect('back');
    }
};

exports.inscribirEstudianteRedireccion = async (req, res) => {
    
    const cod_anoSecci = req.params.id; 
    const cedu_escolar = req.params.cedulaEscolar;

    console.log('Cedula Escolar recibida:', cedu_escolar);
    
    try {
        const estudiante = await studentModel.obtenerEstudianteCedula(cedu_escolar);
        const codigo_estud = estudiante ? estudiante.codigo_estud : null;

        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const existeInscripcion = await studentSectionModel.existeInscripcion(cod_anoSecci, codigo_estud);

        if (existeInscripcion) {
            return res.status(400).send('El estudiante ya está inscrito en esta sección');
        }

        const inscripcion = await studentSectionModel.crearInscripcion({
            cod_anoSecci: cod_anoSecci,
            codigo_estud: codigo_estud
        });

        
        if (!inscripcion) {
            return res.status(500).send('Error al inscribir al estudiante');
        }

        res.redirect('/cursantes/' + cod_anoSecci);

    } catch (error) {
        console.error('Error al inscribir estudiante:', error);
        res.redirect('back');
    }
};

exports.eliminarInscripcion = async (req, res) => {
    const cod_inscripc = req.params.id;
    
    try {
        await studentModel.eliminarInscripcion(cod_inscripc);
        res.redirect('back');
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.redirect('back');
    }
};

