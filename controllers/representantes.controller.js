// representante.controller.js
const Representante = require('../models/representante.model.js');
const Persona = require('../models/persona.model.js');
const Estudiante = require('../models/estudiante.model.js');

exports.cargarRepresentantes = async (req, res) => {
    try {
        // Obtener representantes únicos (sin duplicados)
        const representantes = await Representante.obtenerRepresentantesUnicos();
        
        // Obtener los datos de persona para cada representante
        const representantesConDatos = await Promise.all(representantes.map(async (rep) => {
            const persona = await Persona.obtenerPersona(rep.codigo_perso);
            return {
                ...rep,
                ...persona  // Combinamos los datos del representante con los de persona
            };
        }));
        
        // Renderizar vista EJS con los datos
        res.render('page-representantes', {
            title: 'Lista de Representantes',
            representantes: representantesConDatos
        });
    } catch (error) {
        console.error('Error al procesar:', error);
        res.status(500).render('error', {
            message: 'Error interno del servidor',
            error: error
        });
    }
};

exports.detallesRepresentante = async (req, res) => {
    try {
        const codigo_repre = req.params.id;
        
        // Obtener el representante
        const rep = await Representante.obtenerRepresentante(codigo_repre);
        if (!rep) {
            return res.status(404).render('error', {
                message: 'Representante no encontrado'
            });
        }
        
        // Obtener los datos de la persona
        const persona = await Persona.obtenerPersona(rep.codigo_perso);
        if (!persona) {
            return res.status(404).render('error', {
                message: 'Datos de persona no encontrados para este representante'
            });
        }
        
        // Combinar datos del representante
        const representanteCompleto = {
            ...rep,
            ...persona,
            fech_nacimie_formatted: new Date(persona.fech_nacimie).toLocaleDateString()
        };
        
        // Obtener todos los estudiantes que tengan este representante
        const estudiantes = await Estudiante.obtenerTodosEstudiantes();
        const estudiantesDelRepresentante = estudiantes.filter(est => est.codigo_repre == codigo_repre);
        
        // Formatear datos de los estudiantes
        const estudiantesFormateados = estudiantesDelRepresentante.map(est => ({
            ...est,
            fecha_nacimiento_formatted: new Date(est.fecha_nacimiento).toLocaleDateString(),
            status_estud_text: est.status_estud ? 'Activo' : 'Inactivo'
        }));
        
        res.render('page-representante-estudiantes', {
            title: `Detalles de ${persona.primer_nombr} ${persona.primer_apell}`,
            representante: representanteCompleto,
            estudiantes: estudiantesFormateados
        });
    } catch (error) {
        console.error('Error al obtener representante:', error);
        res.status(500).render('error', {
            message: 'Error al cargar detalles del representante',
            error: error
        });
    }
};