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

exports.cargarEstudiantes = async (req, res) => {
    try {
        // Obtener datos del modelo
        const data = await Student.obtenerTodosEstudiantes();
        data.forEach(student => {
            student.tip_sangrees = student.tip_sangrees === true ? "+" : "-"; 
        });

        
        // Renderizar vista EJS con los datos
        res.render('page-estudiantes', {
            title: 'Lista de Estudiantes',
            students: data
        });
    } catch (error) {
        console.error('Error al procesar:', error);
        res.status(500).render('error', {
            message: 'Error interno del servidor',
            error: error
        });
    }
};

exports.detallesEstudiante = async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log('ID del estudiante:', studentId);
        const studentSection = await EstudianSeccion.obtenerUltimaInscripcionPorEstudiante(studentId);
        let cursante;
        if (!studentSection) {
            cursante = {
                nombre_secci: 'No inscrito en ninguna sección'
            };
        }
        else {
         cursante = await Seccion.obtenerSeccion(studentSection.cod_anoSecci);
        }
        
        
        // Obtener datos del estudiante
        const student = await Student.obtenerEstudiante(studentId);

        

        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }

        console.log(student);
        // Formatear datos para la vista
        student.tip_sangrees = student.tip_sangrees ? "+" : "-";
        student.fecha_nacimiento_formatted = new Date(student.fecha_nacimiento).toLocaleDateString();
        student.status_estud_text = student.status_estud ? 'Activo' : 'Inactivo';
        student.sexo_text = student.sexo === 'M' ? 'Masculino' : 'Femenino';


        
        res.render('page-info-estudiante', {
            title: `Detalles de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            cursante: cursante.nombre_secci
        });
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del estudiante',
            error: error
        });
    }
};

exports.detallesRepresentante = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const tutor = await Tutor.obtenerRepresentante(student.codigo_repre);
        if (!tutor) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(tutor);

        const tutorData = await Person.obtenerPersona(tutor.codigo_perso)

        console.log(tutorData);

        const cleanTutor = {codigo_perso, ...data} = tutor;

        // 3. Formatear datos para la vista
        const formattedRep = {
            ...cleanTutor,
            ...tutorData,
            fecha_nacimiento_formatted: new Date(tutorData.fech_nacimie).toLocaleDateString()
        };
        
        // 4. Renderizar vista
        res.render('page-info-representante', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            tutor: formattedRep
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};

exports.detallesMadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const mother = await Mother.obtenerMadreNino(student.codigo_repre);
        if (!mother) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(mother);

        const motherData = await Person.obtenerPersona(mother.codigo_perso)

        console.log(motherData);

        const cleanMother = {codigo_perso, ...data} = mother;

        // 3. Formatear datos para la vista
        const formattedMot = {
            ...cleanMother,
            ...motherData,
            fecha_nacimiento_formatted: new Date(motherData.fech_nacimie).toLocaleDateString()
        };
        
        // 4. Renderizar vista
        res.render('page-madre', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            mother: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};


exports.detallesPadre = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const father = await Father.obtenerPadreNino(student.codigo_repre);
        if (!father) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(father);

        const fatherData = await Person.obtenerPersona(father.codigo_perso)

        console.log(fatherData);

        const cleanFather = {codigo_perso, ...data} = father;

        // 3. Formatear datos para la vista
        const formattedMot = {
            ...cleanFather,
            ...fatherData,
            fecha_nacimiento_formatted: new Date(fatherData.fech_nacimie).toLocaleDateString()
        };
        
        // 4. Renderizar vista
        res.render('page-padre', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            father: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};

exports.detallesEmergencia = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const emergen = await Emergen.obtenerContactoEmergencia(student.codigo_repre);
        if (!emergen) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(emergen);

        const emergenData = await Person.obtenerPersona(emergen.codigo_perso)

        console.log(emergenData);

        const cleanEmergen = {codigo_perso, ...data} = emergen;

        // 3. Formatear datos para la vista
        const formattedMot = {
            ...cleanEmergen,
            ...emergenData,
            fecha_nacimiento_formatted: new Date(emergenData.fech_nacimie).toLocaleDateString()
        };
        
        // 4. Renderizar vista
        res.render('page-info-emergencia', {
            title: `Representante de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            emergen: formattedMot
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};

exports.detallesSocioFamiliar = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const socfam = await SocFam.obtenerAmSocFam(student.codigo_repre);
        if (!socfam) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(socfam);

    
        // 4. Renderizar vista
        res.render('page-info-sociofam', {
            title: `Ambiente de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            socfam: socfam
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};

exports.detallesProblemasNacimiento = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const probnac = await ProbNac.obtenerProblNac(student.codigo_repre);
        if (!probnac) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(probnac);

    
        // 4. Renderizar vista
        res.render('page-problem-nac', {
            title: `Ambiente de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            probnac: probnac
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};


exports.detallesAntecedentesPrenatales = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // 1. Obtener el estudiante
        const student = await Student.obtenerEstudiante(studentId);
        if (!student) {
            return res.status(404).render('error', {
                message: 'Estudiante no encontrado'
            });
        }
        
        // 2. Obtener el representante usando el código de la relación
        const antepre = await AntePren.obtenerAntePren(student.codigo_repre);
        if (!antepre) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado para este estudiante'
            });
        }
        
        console.log(antepre);

    
        // 4. Renderizar vista
        res.render('page-antecedentes', {
            title: `Ambiente de ${student.primer_nombr} ${student.primer_apell}`,
            student: student,
            antepre: antepre
        });
        
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};

exports.buscarEstudiantePorCedula = async (req, res) => {
    try {
        const cedula = req.query.cedulaEscolar;
        if (!cedula) {
            return res.status(400).send('Cédula escolar es requerida para la búsqueda');
        }

        const student = await Student.obtenerEstudianteCedula(cedula);

        if (!student) {
            return res.status(404).render('page-estudiantes', {
                title: 'Resultado de búsqueda',
                students: []
            });
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
        res.status(500).send('Error interno del servidor al buscar estudiante');
    }
};