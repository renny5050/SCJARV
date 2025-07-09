const erorManager = require('../js/errorManager.js');

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
        erorManager.handle(error, res, 'Error al listar secciones');
    }
};

// Crear nueva sección
exports.crearSeccion = async (req, res) => {
    const nombre_secci = req.body.nombre_secci

    if (!nombre_secci) {
        return erorManager.handle(
            new Error('El nombre de la sección es requerido'), 
            res, 
            'Datos incompletos', 
            400
        );
    }
    
    try {
        await seccionModel.crearSeccion(nombre_secci);
        res.redirect('/secciones');
    } catch (error) {
        erorManager.handle(error, res, 'Error al crear sección');
    }
};

// Actualizar una sección existente
exports.actualizarSeccion = async (req, res) => {
    const codigo_secci = req.params.id;
    const nombre_secci = req.body.nombre_secci ? req.body.nombre_secci.trim() : '';
    
    if (!nombre_secci) {
        return erorManager.handle(
            new Error('El nombre de la sección es requerido'), 
            res, 
            'Datos incompletos', 
            400
        );
    }
    
    try {
        await seccionModel.actualizarSeccion(codigo_secci, { nombre_secci });
        res.redirect('/secciones');
    } catch (error) {
        erorManager.handle(error, res, 'Error al actualizar sección');
    }
};

// Eliminar una sección
exports.eliminarSeccion = async (req, res) => {
    const codigo_secci = req.params.id;
    try {
        await seccionModel.eliminarSeccion(codigo_secci);
        res.redirect('/secciones');
    } catch (error) {
        erorManager.handle(error, res, 'Error al eliminar sección');
    }
};