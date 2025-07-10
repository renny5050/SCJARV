const erorManager = require('../js/errorManager.js');
const studentModel = require('../models/estudiante.model.js');
const anioSeccionModel = require('../models/anioSeccion.model.js');
const studentSectionModel = require('../models/studentsection.model.js');
const Persona = require('../models/persona.model.js');
const seccionModel = require('../models/section.model.js');

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

exports.generarPDFInscripciones = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        
        // Validar ID de año-sección
        if (!cod_anoSecci || isNaN(cod_anoSecci)) {
            const error = new Error('ID de año-sección inválido');
            error.status = 400;
            throw error;
        }

        // Obtener estudiantes inscritos
        const estudiantes = await studentSectionModel.obtenerInscripcionesPorAnoSeccion(cod_anoSecci);
        
        // Obtener información de la sección
        const dataSeccion = await anioSeccionModel.obtenerAnoSeccion(cod_anoSecci);
        if (!dataSeccion) {
            const error = new Error('Sección no encontrada');
            error.status = 404;
            throw error;
        }

        const seccion = await seccionModel.obtenerSeccion(dataSeccion.codigo_secci);


        console.log('Datos de la sección:', seccion);   
        
        // Obtener docentes
        const docentePrincipal = await Persona.obtenerPersona(dataSeccion.docente_prin);
        const docenteSecundario = await Persona.obtenerPersona(dataSeccion.docente_secu);

        // Formatear datos de estudiantes (sin estado y tipo de sangre)
        const estudiantesFormateados = estudiantes.map(est => ({
            ...est,
            nombreCompleto: `${est.primer_nombr} ${est.segundo_nomb || ''} ${est.primer_apell} ${est.segundo_apellido || ''}`,
            fechaNac: new Date(est.fecha_nacimiento).toLocaleDateString('es-ES')
        }));

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'legal',
            margin: 30,
            layout: 'portrait',
            info: {
                Title: `Lista de Estudiantes Inscritos - Sección ${cod_anoSecci}`,
                Author: 'Sistema Escolar',
                CreationDate: new Date()
            }
        });

        // Configurar respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="lista_estudiantes_seccion_${cod_anoSecci}.pdf"`);
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);

        // --- CONTENIDO DEL PDF ---
        
        // Logo y encabezado
        const logoPath = path.join(__dirname, '../assets/images/Logo.png');
        const imgWidth = 80;
        const imgHeight = 80;
        const imgX = 30;
        const imgY = doc.y;

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, imgX, imgY, { width: imgWidth, height: imgHeight });
        } else {
            console.error('Logo no encontrado en la ruta:', logoPath);
            doc.font('Helvetica-Bold')
                .fontSize(13)
                .fillColor('#1a237e')
                .text('Logo no disponible', imgX, imgY, { width: imgWidth, align: 'center' });
        }

        doc.moveUp(2); // Sube en Y antes de hacer el título

        const titleY = doc.y;
        // Agregar nombre de la institución arriba del título
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#1a237e')
            .text('CENTRO DE EDUCACIÓN INICIAL SIMONCITO', { align: 'center' })
            .text('"J.A. ROMÁN VALECILLOS"', { align: 'center' })
            .text('SAN CRISTÓBAL', { align: 'center' })
            .text('ESTADO TÁCHIRA', { align: 'center' })
            .moveDown(0.3);

        const titleText = 'LISTA DE ESTUDIANTES INSCRITOS';

        // Título centrado
        doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#1a237e')
            .text(titleText, { align: 'center' })
            .moveDown(0.5);

        // Información de la sección
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#0d47a1')
            .text(`Sección: ${seccion.nombre_secci}`, { align: 'center' })
            .moveDown(0.5);

        // Fecha de generación
        doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#333')
            .text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' })
            .moveDown(0.5);

        // Tabla de estudiantes
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#0d47a1')
            .text('DETALLES DE LOS ESTUDIANTES', { align: 'center' })
            .moveDown(1);

        // Encabezados de tabla (3 columnas)
        const startY = doc.y;
        const columnWidth = (doc.page.width - 60) / 3; // 3 columnas en lugar de 5
        const rowHeight = 25;
        
        // Dibujar encabezados
        doc.font('Helvetica-Bold')
            .fontSize(10);

        // Fondo para encabezados
        doc.rect(30, startY, doc.page.width - 60, rowHeight)
            .fillAndStroke('#1a237e', '#1a237e');

        // Restablecer color de texto a blanco después del rectángulo
        doc.fillColor('#FFFFFF');

        // Texto de encabezados (sin Estado y Tipo Sangre)
        doc.text('Cédula', 35, startY + 8);
        doc.text('Nombre Completo', 35 + columnWidth, startY + 8);
        doc.text('Fecha Nac.', 35 + columnWidth * 2, startY + 8);
        
        let currentY = startY + rowHeight;
        
        // Alternar colores para filas
        const rowColors = ['#f8f9fa', '#ffffff'];
        
        // Datos de estudiantes
        estudiantesFormateados.forEach((est, index) => {
            const rowColor = rowColors[index % 2];
            
            // Fondo de fila
            doc.rect(30, currentY, doc.page.width - 60, rowHeight)
                .fillAndStroke(rowColor, '#e0e0e0');
            
            // Contenido de fila
            doc.font('Helvetica')
                .fontSize(9)
                .fillColor('#333333');


            const prefijo = est.nacionalidad === 'V' || est.nacionalidad === 'E' ? est.nacionalidad : 'V';
            doc.text(`${prefijo}-${est.cedu_escolar || 'N/A'}`, 35, currentY + 8);
            
            // Nombre completo
            doc.text(est.nombreCompleto || 'N/A', 35 + columnWidth, currentY + 8, {
                width: columnWidth - 5,
                ellipsis: true
            });
            
            // Fecha de nacimiento
            doc.text(est.fechaNac || 'N/A', 35 + columnWidth * 2, currentY + 8);
            
            currentY += rowHeight;
            
            // Verificar si necesitamos nueva página
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 30;
                
                // Dibujar encabezados en nueva página (sin Estado y Tipo Sangre)
                doc.font('Helvetica-Bold')
                    .fontSize(10);

                doc.rect(30, currentY, doc.page.width - 60, rowHeight)
                        .fillAndStroke('#1a237e', '#1a237e');

                    // Restablecer color de texto a blanco
                    doc.fillColor('#FFFFFF');

                    doc.text('Cédula', 35, currentY + 8);
                    doc.text('Nombre Completo', 35 + columnWidth, currentY + 8);
                    doc.text('Fecha Nac.', 35 + columnWidth * 2, currentY + 8);
                    
                    currentY += rowHeight;
            }
        });

        // Total de estudiantes
        doc.moveDown(2);
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#1a237e')
            .text(`Total de Estudiantes: ${estudiantesFormateados.length}`, { align: 'right' });

        // Pie de página
        doc.moveDown(3);
        doc.font('Helvetica-Oblique')
            .fontSize(10)
            .fillColor('#666')
            .text('Sistema Escolar - © ' + new Date().getFullYear(), { align: 'center' });

        // Finalizar documento
        doc.end();

    } catch (error) {
        erorManager.handle(error, res, 'Error al generar PDF de inscripciones');
    }
};

exports.mostrarInscripciones = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        
        // Validar ID de año-sección
        if (!cod_anoSecci || isNaN(cod_anoSecci)) {
            const error = new Error('ID de año-sección inválido');
            error.status = 400;
            throw error;
        }

        // Obtener estudiantes inscritos
        const estudiantes = await studentSectionModel.obtenerInscripcionesPorAnoSeccion(cod_anoSecci);
        
        // Obtener información de la sección
        const dataSeccion = await anioSeccionModel.obtenerAnoSeccion(cod_anoSecci);
        if (!dataSeccion) {
            const error = new Error('Sección no encontrada');
            error.status = 404;
            throw error;
        }
        
        // Obtener docentes
        const docentePrincipal = await Persona.obtenerPersona(dataSeccion.docente_prin);
        const docenteSecundario = await Persona.obtenerPersona(dataSeccion.docente_secu);

        // Formatear datos de estudiantes
        const estudiantesFormateados = estudiantes.map(est => ({
            ...est,
            nombreCompleto: `${est.primer_nombr} ${est.segundo_nomb || ''} ${est.primer_apell} ${est.segundo_apellido || ''}`,
            estado: est.status_estud === 1 ? 'Activo' : 'Inactivo',
            fechaNac: new Date(est.fecha_nacimiento).toLocaleDateString('es-ES'),
            tieneTipoSangre: est.tip_sangrees === 1 ? 'Sí' : 'No'
        }));

        res.render('page-cursantes', {
            title: 'Estudiantes Inscritos',
            estudiantes: estudiantesFormateados,
            cod_anoSecci: cod_anoSecci,
            docente_prin: docentePrincipal,
            docente_secu: docenteSecundario
        });
        
    } catch (error) {
        erorManager.handle(error, res, 'Error al mostrar inscripciones', error.status || 500);
    }
};

const inscribirEstudianteInterno = async (cod_anoSecci, cedu_escolar, res) => {
    try {
        // Validar parámetros
        if (!cod_anoSecci || !cedu_escolar) {
            const error = new Error('Parámetros requeridos faltantes');
            error.status = 400;
            throw error;
        }

        // Buscar estudiante
        const estudiante = await studentModel.obtenerEstudianteCedula(cedu_escolar);
        if (!estudiante) {
            const error = new Error('Estudiante no encontrado');
            error.status = 404;
            throw error;
        }
        
        // Verificar si ya está inscrito
        const existeInscripcion = await studentSectionModel.existeInscripcion(cod_anoSecci, estudiante.codigo_estud);
        if (existeInscripcion) {
            const error = new Error('El estudiante ya está inscrito en esta sección');
            error.status = 400;
            throw error;
        }

        // Crear inscripción
        const inscripcion = await studentSectionModel.crearInscripcion({
            cod_anoSecci: cod_anoSecci,
            codigo_estud: estudiante.codigo_estud
        });

        if (!inscripcion) {
            const error = new Error('Error al inscribir al estudiante');
            error.status = 500;
            throw error;
        }

        return inscripcion;
    } catch (error) {
        throw error;
    }
};

exports.inscribirEstudiante = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        const cedu_escolar = req.body.cedu_escolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.inscribirEstudianteEnlace = async (req, res) => {
    try {
        const cod_anoSecci = req.params.id;
        const cedu_escolar = req.params.cedulaEscolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.inscribirEstudianteRedireccion = async (req, res) => {
    try {
        const cod_anoSecci = req.body.cod_anoSecci;
        const cedu_escolar = req.body.cedu_escolar;
        
        await inscribirEstudianteInterno(cod_anoSecci, cedu_escolar, res);
        res.redirect('/cursantes/' + cod_anoSecci);
    } catch (error) {
        erorManager.handle(error, res, 'Error al inscribir estudiante', error.status || 500);
    }
};

exports.eliminarInscripcion = async (req, res) => {
    try {
        const cod_inscripc = req.params.id;
        
        // Validar ID de inscripción
        if (!cod_inscripc || isNaN(cod_inscripc)) {
            const error = new Error('ID de inscripción inválido');
            error.status = 400;
            throw error;
        }

        // Verificar si existe la inscripción
        const inscripcion = await studentSectionModel.obtenerInscripcion(cod_inscripc);
        if (!inscripcion) {
            const error = new Error('Inscripción no encontrada');
            error.status = 404;
            throw error;
        }

        // Eliminar inscripción
        await studentSectionModel.eliminarInscripcion(cod_inscripc);
        res.redirect('back');
    } catch (error) {
        erorManager.handle(error, res, 'Error al eliminar inscripción', error.status || 500);
    }
};