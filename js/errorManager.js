// js/errorManager.js
module.exports = {
    handle: (error, res, errorTitle = 'Error en el sistema', statusCode = 500) => {
        console.error(`${errorTitle}:`, error);
        
        // En producción, no exponemos detalles técnicos a los usuarios
        const errorDetails = process.env.NODE_ENV === 'development' ? 
            error.stack || error.message : 
            'Por favor contacte al soporte técnico';
        
        res.status(statusCode).render('page-error', {
            statusCode: statusCode,
            errorTitle: errorTitle,
            errorMessage: error.message || 'Ocurrió un problema inesperado',
            errorDetails: errorDetails,
            errorId: Date.now()
        });
    }
};