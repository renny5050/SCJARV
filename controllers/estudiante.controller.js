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
        console.error('Error al procesar:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.detallesEstudiante = async (req, res) => {
    try {
        const studentId = req.params.id;
        const studentSection = await EstudianSeccion.obtenerUltimaInscripcionPorEstudiante(studentId);
        console.log('Ultima inscripción del estudiante:', studentSection);
        const seccionData = await AnioSeccion.obtenerAnoSeccion(studentSection.cod_anoSecci);
        console.log('ID del estudiante:', studentId);
        console.log('Sección del estudiante:', seccionData);
        let cursante;
        
        if (!studentSection) {
            cursante = { nombre_secci: 'No inscrito en ninguna sección' };
        } else {
            cursante = await Seccion.obtenerSeccion(seccionData.codigo_secci);
        }
        
        console.log('Cursante:', cursante);

        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
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
        console.error('Error al obtener estudiante:', error);
        res.status(500).send('Error al cargar detalles del estudiante');
    }
};

exports.detallesRepresentante = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const tutor = await Tutor.obtenerRepresentante(student.codigo_repre);
        console.log('Tutor encontrado:', tutor);
        if (!tutor) {
            return res.status(404).send('Representante no encontrado para este estudiante');
        }

        const tutorData = await Person.obtenerPersona(tutor.codigo_perso);
        console.log('Datos del tutor:', tutorData);
        const cleanTutor = tutorData;
        
        const formattedRep = {
            ...cleanTutor,
            ...tutor,
            fecha_nacimiento_formatted: new Date(tutorData.fech_nacimie).toLocaleDateString()
        };
        
        console.log('Representante formateado:', formattedRep);

        res.render('page-info-representante', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            tutor: formattedRep
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).send('Error al cargar detalles del representante');
    }
};

exports.detallesMadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const mother = await Mother.obtenerMadreNino(student.codigo_repre);
        if (!mother) {
            return res.status(404).send('Madre no encontrada para este estudiante');
        }

        const motherData = await Person.obtenerPersona(mother.codigo_perso);
        const cleanMother = motherData;
        
        const formattedMot = {
            ...cleanMother,
            ...motherData,
            fecha_nacimiento_formatted: new Date(motherData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-madre', {
            title: `Madre de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            mother: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener madre:', error);
        res.status(500).send('Error al cargar detalles de la madre');
    }
};

exports.detallesPadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const father = await Father.obtenerPadreNino(student.codigo_repre);
        if (!father) {
            return res.status(404).send('Padre no encontrado para este estudiante');
        }

        const fatherData = await Person.obtenerPersona(father.codigo_perso);
        const cleanFather = fatherData;
        
        const formattedMot = {
            ...cleanFather,
            ...fatherData,
            fecha_nacimiento_formatted: new Date(fatherData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-padre', {
            title: `Padre de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            father: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener padre:', error);
        res.status(500).send('Error al cargar detalles del padre');
    }
};

exports.detallesEmergencia = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const emergen = await Emergen.obtenerContactoEmergencia(student.codigo_repre);
        if (!emergen) {
            return res.status(404).send('Contacto de emergencia no encontrado');
        }

        const emergenData = await Person.obtenerPersona(emergen.codigo_perso);
        const cleanEmergen = emergenData;
        
        const formattedMot = {
            ...cleanEmergen,
            ...emergenData,
            fecha_nacimiento_formatted: new Date(emergenData.fech_nacimie).toLocaleDateString()
        };
        
        res.render('page-info-emergencia', {
            title: `Contacto de emergencia de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            emergen: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener contacto de emergencia:', error);
        res.status(500).send('Error al cargar contacto de emergencia');
    }
};

exports.detallesSocioFamiliar = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const socfam = await SocFam.obtenerAmSocFam(student.codigo_repre);
        if (!socfam) {
            return res.status(404).send('Ambiente sociofamiliar no encontrado');
        }
        
        res.render('page-info-sociofam', {
            title: `Ambiente de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            socfam: socfam
        });
        
    } catch (error) {
        console.error('Error al obtener ambiente sociofamiliar:', error);
        res.status(500).send('Error al cargar ambiente sociofamiliar');
    }
};

exports.detallesProblemasNacimiento = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const probnac = await ProbNac.obtenerProblNac(student.codigo_repre);
        if (!probnac) {
            return res.status(404).send('Problemas de nacimiento no encontrados');
        }
        
        res.render('page-problem-nac', {
            title: `Problemas de nacimiento de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            probnac: probnac
        });
        
    } catch (error) {
        console.error('Error al obtener problemas de nacimiento:', error);
        res.status(500).send('Error al cargar problemas de nacimiento');
    }
};

exports.detallesAntecedentesPrenatales = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.obtenerEstudiante(studentId);
        
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
        }
        
        const antepre = await AntePren.obtenerAntePren(student.codigo_repre);
        if (!antepre) {
            return res.status(404).send('Antecedentes prenatales no encontrados');
        }
        
        res.render('page-antecedentes', {
            title: `Antecedentes de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            antepre: antepre
        });
        
    } catch (error) {
        console.error('Error al obtener antecedentes prenatales:', error);
        res.status(500).send('Error al cargar antecedentes prenatales');
    }
};

exports.buscarEstudiantePorCedula = async (req, res) => {
    try {
        const cedula = req.query.cedulaEscolar;
        if (!cedula) {
            return res.status(400).send('Debe proporcionar una cédula para la búsqueda');
        }

        const student = await Student.obtenerEstudianteCedula(cedula);
        if (!student) {
            return res.status(404).send('Estudiante no encontrado');
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
        console.error('Error al buscar estudiante por cédula:', error);
        res.status(500).send('Error interno del servidor');
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
        console.error('Error al contar estudiantes por género:', error);
        res.status(500).send('Error interno del servidor');
    }
};