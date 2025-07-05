// seccionController.js
const seccionModel = require('../models/section.model.js');

// Listar todas las secciones
exports.listarSecciones = async (req, res) => {
    let cedulaEscolar = null;
    if (req.params.cedulaEscolar) {
        cedulaEscolar = req.params.cedulaEscolar;
    } else {
        cedulaEscolar = null;
    }
    try {
        const secciones = await seccionModel.obtenerTodasSecciones();
        
        res.render('page-secciones', {
            title: 'Gestión de Secciones',
            secciones: secciones,
            cedulaEscolar: cedulaEscolar
        });
    } catch (error) {
        console.error('Error al listar secciones:', error);
        res.redirect('/secciones');
    }
};

// Crear nueva sección
exports.crearSeccion = async (req, res) => {
    const nombre_secci = req.body.nombre_secci

    console.log('Nombre de sección recibido:', nombre_secci);
    
    if (!nombre_secci) {
        return res.redirect('/secciones');
    }
    
    try {
        await seccionModel.crearSeccion(nombre_secci);
        res.redirect('/secciones');
    } catch (error) {
        console.error('Error al crear sección:', error);
        res.redirect('/secciones');
    }
};

// Actualizar una sección existente
exports.actualizarSeccion = async (req, res) => {
    const codigo_secci = req.params.id;
    const nombre_secci = req.body.nombre_secci ? req.body.nombre_secci.trim() : '';
    
    if (!nombre_secci) {
        return res.redirect('/secciones');
    }
    
    try {
        await seccionModel.actualizarSeccion(codigo_secci, { nombre_secci });
        res.redirect('/secciones');
    } catch (error) {
        console.error('Error al actualizar sección:', error);
        res.redirect('/secciones');
    }
};

// Eliminar una sección
exports.eliminarSeccion = async (req, res) => {
    const codigo_secci = req.params.id;
    console.log('Código de sección a eliminar:', codigo_secci);
    try {
        await seccionModel.eliminarSeccion(codigo_secci);
        res.redirect('/secciones');
    } catch (error) {
        console.error('Error al eliminar sección:', error);
        res.redirect('/secciones');
    }
};