const erorManager = require('../js/errorManager.js');

// representante.controller.js
const Representante = require('../models/representante.model.js');
const Persona = require('../models/persona.model.js');
const Estudiante = require('../models/estudiante.model.js');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ... otras funciones existentes ...

exports.generarPDFRepresentantes = async (req, res) => {
    try {
        // Obtener representantes con datos de persona
        const representantes = await Representante.obtenerRepresentantesUnicos();
        
        const representantesConDatos = await Promise.all(representantes.map(async (rep) => {
            const persona = await Persona.obtenerPersona(rep.codigo_perso);
            return {
                ...rep,
                ...persona,
                nombre_completo: `${persona.primer_nombr} ${persona.segundo_nomb || ''} ${persona.primer_apell} ${persona.segund_apell || ''}`,
                fech_nacimie_formatted: new Date(persona.fech_nacimie).toLocaleDateString()
            };
        }));

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'legal',
            margin: 30,
            layout: 'portrait',
            info: {
                Title: `Lista de Representantes`,
                Author: 'Sistema Escolar',
                CreationDate: new Date()
            }
        });

        // Configurar respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="lista_representantes.pdf"`);
        
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

        const titleText = 'LISTA DE REPRESENTANTES';

        // Título centrado
        doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#1a237e')
            .text(titleText, { align: 'center' })
            .moveDown(0.5);

        // Fecha de generación
        doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#333')
            .text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' })
            .moveDown(0.5);

        // Tabla de representantes
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#0d47a1')
            .text('DETALLES DE LOS REPRESENTANTES', { align: 'center' })
            .moveDown(1);

        // Encabezados de tabla
        const startY = doc.y;
        const columnWidth = (doc.page.width - 60) / 5;
        const rowHeight = 25;
        
        // Dibujar encabezados
        doc.font('Helvetica-Bold')
    .fontSize(10);

// Fondo para encabezados
doc.rect(30, startY, doc.page.width - 60, rowHeight)
    .fillAndStroke('#1a237e', '#1a237e');

// Restablecer el color del texto a blanco después del rectángulo
doc.fillColor('#FFFFFF');

// Texto de encabezados
doc.text('Cédula', 35, startY + 8);
doc.text('Nombre Completo', 35 + columnWidth, startY + 8);
doc.text('Teléfono', 35 + columnWidth * 2, startY + 8);
doc.text('Dirección', 35 + columnWidth * 3, startY + 8);
doc.text('Fecha Nacimiento', 35 + columnWidth * 4, startY + 8);
        
        let currentY = startY + rowHeight;
        
        // Alternar colores para filas
        const rowColors = ['#f8f9fa', '#ffffff'];
        
        // Datos de representantes
        representantesConDatos.forEach((rep, index) => {
            const rowColor = rowColors[index % 2];
            
            // Fondo de fila
            doc.rect(30, currentY, doc.page.width - 60, rowHeight)
                .fillAndStroke(rowColor, '#e0e0e0');
            
            // Contenido de fila
            doc.font('Helvetica')
                .fontSize(9)
                .fillColor('#333333');
            
            doc.text('V-' + rep.cedula || 'N/A', 35, currentY + 8);
            doc.text(rep.nombre_completo || 'N/A', 35 + columnWidth, currentY + 8, {
                width: columnWidth - 5,
                ellipsis: true
            });
            doc.text(rep.prin_telefono || 'N/A', 35 + columnWidth * 2, currentY + 8);
            doc.text(rep.direcc_perso || 'N/A', 35 + columnWidth * 3, currentY + 8, {
                width: columnWidth - 5,
                ellipsis: true
            });
            doc.text(rep.fech_nacimie_formatted || 'N/A', 35 + columnWidth * 4, currentY + 8);
            
            currentY += rowHeight;
            
            // Verificar si necesitamos nueva página
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 30;
                
                // Dibujar encabezados en nueva página
                doc.font('Helvetica-Bold')
                    .fontSize(10)
                    .fillColor('#ffffff');
                
                doc.rect(30, currentY, doc.page.width - 60, rowHeight)
                    .fillAndStroke('#1a237e', '#1a237e');
                
                doc.text('Cédula', 35, currentY + 8);
                doc.text('Nombre Completo', 35 + columnWidth, currentY + 8);
                doc.text('Teléfono', 35 + columnWidth * 2, currentY + 8);
                doc.text('Dirección', 35 + columnWidth * 3, currentY + 8);
                doc.text('Fecha Nacimiento', 35 + columnWidth * 4, currentY + 8);
                
                currentY += rowHeight;
            }
        });

        // Total de representantes
        doc.moveDown(2);
        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#1a237e')
            .text(`Total de Representantes: ${representantesConDatos.length}`, { align: 'right' });

        // Pie de página
        doc.moveDown(3);
        doc.font('Helvetica-Oblique')
            .fontSize(10)
            .fillColor('#666')
            .text('Sistema Escolar - © ' + new Date().getFullYear(), { align: 'center' });

        // Finalizar documento
        doc.end();

    } catch (error) {
        erorManager.handle(error, res, 'Error al generar PDF de representantes');
    }
};

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
        erorManager.handle(error, res, 'Error al cargar representantes');
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
        erorManager.handle(error, res, 'Error al cargar detalles del representante');
    }
};

exports.buscarRepresentantePorCedula = async (req, res) => {
    try {
        const cedula = req.body.cedulaRepresentante;
        if (!cedula) {
            return res.status(400).render('page-error', {
                statusCode: 400,
                errorTitle: 'Datos incompletos',
                errorMessage: 'Cédula del representante es requerida para la búsqueda'
            });
        }

        const persona = await Persona.obtenerPersonaPorCedula(cedula);
        if (!persona) {
            return res.render('page-representantes', {
                title: 'Resultado de búsqueda',
                representantes: [],
                searchMessage: `No se encontró representante con cédula ${cedula}`
            });
        }

        const representante = await Representante.obtenerRepresentantePorPersona(persona.codigo_perso);
        if (!representante) {
            return res.render('page-representantes', {
                title: 'Resultado de búsqueda',
                representantes: [],
                searchMessage: `La persona con cédula ${cedula} no está registrada como representante`
            });
        }

        const representanteCompleto = {
            ...representante,
            ...persona,
            fech_nacimie_formatted: new Date(persona.fech_nacimie).toLocaleDateString()
        };

        res.render('page-representantes', {
            title: 'Resultado de búsqueda',
            representantes: [representanteCompleto],
            searchMessage: `Representante encontrado: ${persona.primer_nombr} ${persona.primer_apell}`
        });
    } catch (error) {
        erorManager.handle(error, res, 'Error al buscar representante por cédula');
    }
};