const erorManager = require('../js/errorManager.js');

const Student = require('../models/estudiante.model.js');
const Tutor = require('../models/representante.model.js');
const Person = require('../models/persona.model.js');
const Mother = require('../models/madre.model.js');
const Father = require('../models/padre.model.js');
const Emergen = require('../models/contactoEmergencia.model.js');
const SocFam = require('../models/ambienteSociofamiliar.model.js');
const ProbNac = require('../models/problemasNacimiento.model.js');
const AntePren = require('../models/antecedentePrenatal.js');
const EstudianSeccion = require('../models/studentsection.model.js');
const Seccion = require('../models/section.model.js');
const AnioSeccion = require('../models/anioSeccion.model.js');

exports.cargarEstudiantes = async (req, res) => {
    try {
        const data = await Student.obtenerTodosEstudiantes();
        data.forEach(student => {
            student.tip_sangrees = student.tip_sangrees === true ? "+" : "-"; 
        });
        
        res.render('page-estudiantes', {
            title: 'Lista de Estudiantes',
            students: data
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar estudiantes', 500);
    }
};

exports.detallesEstudiante = async (req, res) => {
    try {
        const studentId = req.params.id;
        const studentSection = await EstudianSeccion.obtenerUltimaInscripcionPorEstudiante(studentId);
        let seccionData;
        
        if (!studentSection || !studentSection.cod_anoSecci) {
            seccionData = { codigo_secci: null, nombre_secci: 'No inscrito en ninguna sección' };
        } else {
            seccionData = await AnioSeccion.obtenerAnoSeccion(studentSection.cod_anoSecci);
        }
        
        let cursante;
        if (!studentSection) {
            cursante = { nombre_secci: 'No inscrito en ninguna sección' };
        } else {
            cursante = await Seccion.obtenerSeccion(seccionData.codigo_secci);
        }

        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }

        student.tip_sangrees = student.tip_sangrees ? "+" : "-";
        student.fecha_nacimiento_formatted = new Date(student.fecha_nacimiento).toLocaleDateString();
        student.status_estud_text = student.status_estud ? 'Activo' : 'Inactivo';
        student.sexo_text = student.sexo === 'M' ? 'Masculino' : 'Femenino';
        
        res.render('page-info-estudiante', {
            title: `Detalles de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            cursante: cursante && cursante.nombre_secci ? cursante.nombre_secci : 'No inscrito en ninguna sección'
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar detalles del estudiante', error.status || 500);
    }
};

exports.detallesRepresentante = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const tutor = await Tutor.obtenerRepresentante(student.codigo_repre);
        if (!tutor) {
            const error = new Error('Representante no encontrado para este estudiante');
            error.status = 404;
            throw error;
        }

        const tutorData = await Person.obtenerPersona(tutor.codigo_perso);
        const formattedRep = {
            ...tutorData,
            ...tutor,
            fecha_nacimiento_formatted: new Date(tutorData.fech_nacimie).toLocaleDateString()
        };

        res.render('page-info-representante', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            tutor: formattedRep
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar detalles del representante', error.status || 500);
    }
};

exports.detallesMadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const mother = await Mother.obtenerMadreNino(student.codigo_repre);
        if (!mother) {
            const error = new Error('Madre no encontrada para este estudiante');
            error.status = 404;
            throw error;
        }

        const motherData = await Person.obtenerPersona(mother.codigo_perso);
        const formattedMot = {
            ...motherData,
            ...mother,
            fecha_nacimiento_formatted: new Date(motherData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-madre', {
            title: `Madre de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            mother: formattedMot
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar detalles de la madre', error.status || 500);
    }
};

exports.detallesPadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const father = await Father.obtenerPadreNino(student.codigo_repre);
        if (!father) {
            const error = new Error('Padre no encontrado para este estudiante');
            error.status = 404;
            throw error;
        }

        const fatherData = await Person.obtenerPersona(father.codigo_perso);
        const formattedMot = {
            ...fatherData,
            ...father,
            fecha_nacimiento_formatted: new Date(fatherData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-padre', {
            title: `Padre de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            father: formattedMot
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar detalles del padre', error.status || 500);
    }
};

exports.detallesEmergencia = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const emergen = await Emergen.obtenerContactoEmergencia(student.codigo_repre);
        if (!emergen) {
            const error = new Error('Contacto de emergencia no encontrado');
            error.status = 404;
            throw error;
        }

        const emergenData = await Person.obtenerPersona(emergen.codigo_perso);
        const formattedMot = {
            ...emergenData,
            ...emergen,
            fecha_nacimiento_formatted: new Date(emergenData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-info-emergencia', {
            title: `Contacto de emergencia de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            emergen: formattedMot
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar contacto de emergencia', error.status || 500);
    }
};

exports.detallesSocioFamiliar = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const socfam = await SocFam.obtenerAmSocFam(student.codigo_repre);
        if (!socfam) {
            const error = new Error('Ambiente sociofamiliar no encontrado');
            error.status = 404;
            throw error;
        }
        
        res.render('page-info-sociofam', {
            title: `Ambiente de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            socfam: socfam
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar ambiente sociofamiliar', error.status || 500);
    }
};

exports.detallesProblemasNacimiento = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const probnac = await ProbNac.obtenerProblNac(student.codigo_repre);
        if (!probnac) {
            const error = new Error('Problemas de nacimiento no encontrados');
            error.status = 404;
            throw error;
        }
        
        res.render('page-problem-nac', {
            title: `Problemas de nacimiento de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            probnac: probnac
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar problemas de nacimiento', error.status || 500);
    }
};

exports.detallesAntecedentesPrenatales = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        const antepre = await AntePren.obtenerAntePren(student.codigo_repre);
        if (!antepre) {
            const error = new Error('Antecedentes prenatales no encontrados');
            error.status = 404;
            throw error;
        }
        
        res.render('page-antecedentes', {
            title: `Antecedentes de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            antepre: antepre
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al cargar antecedentes prenatales', error.status || 500);
    }
};

exports.buscarEstudiantePorCedula = async (req, res) => {
    try {
        const cedula = req.query.cedulaEscolar;
        if (!cedula) {
            const error = new Error('Debe proporcionar una cédula para la búsqueda');
            error.status = 400;
            throw error;
        }

        const student = await Student.obtenerEstudianteCedula(cedula);
        if (!student) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }

        student.tip_sangrees = student.tip_sangrees ? "+" : "-";
        student.fecha_nacimiento_formatted = new Date(student.fecha_nacimiento).toLocaleDateString();
        student.status_estud_text = student.status_estud ? 'Activo' : 'Inactivo';
        student.sexo_text = student.sexo === 'M' ? 'Masculino' : 'Femenino';

        res.render('page-estudiantes', {
            title: 'Resultado de búsqueda',
            students: [student]
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al buscar estudiante por cédula', error.status || 500);
    }
};

exports.contarEstudiantesPorGenero = async (req, res) => {
    try {
        const estudiantes = await Student.obtenerTodosEstudiantes();
        let masculinos = 0;
        let femeninos = 0;

        estudiantes.forEach(est => {
            if (est.sexo === 'M') {
                masculinos++;
            } else if (est.sexo === 'F') {
                femeninos++;
            }
        });

        res.render('page-datos', {
            title: 'Conteo de Estudiantes por Género',
            masculinos,
            femeninos
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al contar estudiantes por género', 500);
    }
};