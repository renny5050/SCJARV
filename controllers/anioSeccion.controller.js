// anoSeccionController.js
const anoSeccionModel = require('../models/anioSeccion.model.js');

const seccionModel = require('../models/section.model.js'); // Asegúrate de importar el modelo de secciones
const Persona = require('../models/persona.model.js'); // Asegúrate de importar el modelo de personas


const listarDocentes = async (req, res) => {
    try {
        const docentesData = await Persona.obtenerTodasPersonas();
        // Filtrar solo los docentes
        const docentes = docentesData.filter(docente => docente.docente === 1);

        return docentes;
    } catch (error) {
        console.error('Error al listar docentes:', error);
        res.redirect('/docentes');
    }
};


exports.listarAnoSeccion = async (req, res) => {
    const codigo_secci = req.params.id; // Cambiado para coincidir con el nombre
    let cedulaEscolar = null;
    if (req.params.cedulaEscolar) {
        cedulaEscolar = req.params.cedulaEscolar;
    } else {
        cedulaEscolar = null;
    }
    try {
        const anoSeccion = await anoSeccionModel.obtenerAnoSeccionesPorSeccion(codigo_secci);
        const cod_anoSecci = anoSeccion.map(ano => ano.cod_anoSecci);

        console.log('Años de la sección:', cod_anoSecci);
        
        // Obtener el nombre de la sección
        const seccion = await seccionModel.obtenerSeccion(codigo_secci);
        const seccionNombre = seccion ? seccion.nombre_secci : null;

        const docentes = await listarDocentes();
        
        res.render('page-anio-seccion', {
            title: 'Años de la Sección',
            anoSeccion: anoSeccion,
            cod_anoSecci: cod_anoSecci,
            codigo_secci: codigo_secci,
            seccionNombre: seccionNombre,
            cedulaEscolar: cedulaEscolar,
            docentes: docentes
        });
    } catch (error) {
        console.error('Error al listar años por sección:', error);
        res.redirect('/secciones');
    }
};

exports.crearAnoSeccion = async (req, res) => {
    const { ano_Seccione, docente_prin, docente_secu } = req.body;
    const  codigo_secci  = req.params.id;
    
    try {
        const cod_anoSecci = await anoSeccionModel.crearAnoSeccion({ ano_Seccione, codigo_secci, docente_prin, docente_secu });
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        console.error('Error al crear asignación año-sección:', error);
        res.redirect('/seccion/' + codigo_secci);
    }
};


exports.actualizarAnoSeccion = async (req, res) => {
    const cod_anoSecci = req.params.id;
    const { ano_Seccione, codigo_secci } = req.body;
    
    try {
        await anoSeccionModel.actualizarAnoSeccion(cod_anoSecci, { ano_Seccione, codigo_secci });
        res.redirect('/secciones');
    } catch (error) {
        console.error('Error al actualizar asignación año-sección:', error);
        res.redirect('/secciones');
    }
};


exports.eliminarAnoSeccion = async (req, res) => {
    const cod_anoSecci = req.params.id;
    
    try {
        await anoSeccionModel.eliminarAnoSeccion(cod_anoSecci);
        res.redirect('/secciones');
    } catch (error) {
        console.error('Error al eliminar asignación año-sección:', error);
        res.redirect('/secciones');
    }
};