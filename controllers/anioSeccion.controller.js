const erorManager = require('../js/errorManager.js');
const anoSeccionModel = require('../models/anioSeccion.model.js');
const seccionModel = require('../models/section.model.js');
const Persona = require('../models/persona.model.js');

// Función auxiliar para listar docentes
const listarDocentes = async () => {
    try {
        const docentesData = await Persona.obtenerTodasPersonas();
        return docentesData.filter(docente => docente.docente === 1);
    } catch (error) {
        throw new Error('Error al obtener la lista de docentes');
    }
};

exports.listarAnoSeccion = async (req, res) => {
    try {
        const codigo_secci = req.params.id;
        const cedulaEscolar = req.params.cedulaEscolar || null;

        // Obtener años de la sección
        const anoSeccion = await anoSeccionModel.obtenerAnoSeccionesPorSeccion(codigo_secci);
        const cod_anoSecci = anoSeccion.map(ano => ano.cod_anoSecci);

        // Obtener nombre de la sección
        const seccion = await seccionModel.obtenerSeccion(codigo_secci);
        if (!seccion) {
            const error = new Error('Sección no encontrada');
            error.status = 404;
            throw error;
        }

        // Obtener lista de docentes
        const docentes = await listarDocentes();

        res.render('page-anio-seccion', {
            title: 'Años de la Sección',
            anoSeccion: anoSeccion,
            cod_anoSecci: cod_anoSecci,
            codigo_secci: codigo_secci,
            seccionNombre: seccion.nombre_secci,
            cedulaEscolar: cedulaEscolar,
            docentes: docentes
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al listar años por sección', error.status || 500);
    }
};

exports.crearAnoSeccion = async (req, res) => {
    try {
        const { ano_Seccione, docente_prin, docente_secu } = req.body;
        const codigo_secci = req.params.id;
        
        // Validar campos obligatorios
        if (!ano_Seccione || !codigo_secci) {
            const error = new Error('Faltan campos obligatorios');
            error.status = 400;
            throw error;
        }

        const cod_anoSecci = await anoSeccionModel.crearAnoSeccion({ 
            ano_Seccione, 
            codigo_secci, 
            docente_prin, 
            docente_secu 
        });
        
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al crear asignación año-sección', error.status || 500);
    }
};

exports.actualizarAnoSeccion = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        const { ano_Seccione, codigo_secci } = req.body;
        
        // Validar campos obligatorios
        if (!ano_Seccione || !codigo_secci) {
            const error = new Error('Faltan campos obligatorios');
            error.status = 400;
            throw error;
        }

        await anoSeccionModel.actualizarAnoSeccion(cod_anoSecci, { ano_Seccione, codigo_secci });
        res.redirect('/secciones');
    } catch (error) {
        erorManager.handle(error, res, 'Error al actualizar asignación año-sección', error.status || 500);
    }
};

exports.eliminarAnoSeccion = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        
        // Verificar si existe la asignación
        const anoSeccion = await anoSeccionModel.obtenerAnoSeccion(cod_anoSecci);
        if (!anoSeccion) {
            const error = new Error('Asignación año-sección no encontrada');
            error.status = 404;
            throw error;
        }

        await anoSeccionModel.eliminarAnoSeccion(cod_anoSecci);
        res.redirect('/secciones');
    } catch (error) {
        erorManager.handle(error, res, 'Error al eliminar asignación año-sección', error.status || 500);
    }
};