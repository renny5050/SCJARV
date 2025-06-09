// controllers/user.controller.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/user.model.js');

// Función para mostrar usuarios (GET)
exports.testUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('testpost', { 
      title: 'Usuarios (Prueba)',
      users: users 
    });
    console.log('Usuarios obtenidos:', users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error en el servidor');
  }
};

// Función para crear un nuevo usuario (POST)
exports.createUser = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).send('El nombre es requerido');
    }

    await User.create(nombre.trim());
    res.redirect('/test');
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).send('Error al crear el usuario');
  }
};


exports.generateEnrollmentForm = async (req, res) => {
  try {
    // Configuración de respuesta
    res.setHeader('Content-disposition', 'attachment; filename=formulario_inscripcion.pdf');
    res.setHeader('Content-type', 'application/pdf');

    // Configuración del documento
    const doc = new PDFDocument({ 
      size: 'legal',
      margin: 15,
      bufferPages: true
    });
    doc.pipe(res);

    // Estilos predefinidos
    const styles = {
      header: { size: 10, font: 'Helvetica-Bold' },
      subheader: { size: 8, font: 'Helvetica' },
      sectionTitle: { size: 8, font: 'Helvetica-Bold' },
      fieldLabel: { size: 7, font: 'Helvetica' },
      fieldBox: { height: 12, padding: 3 }
    };

    // Función para aplicar estilos
    const applyStyle = (style) => {
      doc.font(style.font).fontSize(style.size);
    };

    // Encabezado
    applyStyle(styles.header);
    doc.text('PLANILLA DE INSCRIPCIÓN AÑO ESCOLAR 2024-2025', { align: 'center' })
      .moveDown(0.2);
    
    applyStyle(styles.subheader);
    doc.text('DATOS GENERALES', { align: 'center' })
      .moveDown(0.5);

    // Función para crear sección
    const createSection = (title) => {
      applyStyle(styles.sectionTitle);
      doc.text(title).moveDown(0.2);
    };

    // Función para crear fila de campos
    const createFieldRow = (fields) => {
      const startY = doc.y;
      let currentX = 15;
      
      fields.forEach(field => {
        applyStyle(styles.fieldLabel);
        doc.text(field.label + ':', currentX, startY + styles.fieldBox.padding);
        
        // Dibujar campo
        doc.rect(
          currentX + 40, 
          startY, 
          field.width, 
          field.height || styles.fieldBox.height
        ).stroke();
        
        currentX += field.width + 40;
      });
      
      doc.y = startY + (fields[0].height || styles.fieldBox.height) + 5;
    };

    // Función para campo individual
    const createSingleField = (label, width, height) => {
      applyStyle(styles.fieldLabel);
      doc.text(label + ':', 15, doc.y + styles.fieldBox.padding);
      
      doc.rect(
        60, 
        doc.y, 
        width, 
        height || styles.fieldBox.height
      ).stroke();
      
      doc.y += (height || styles.fieldBox.height) + 5;
    };

    // Definición de todas las secciones
    const sections = [
      {
        title: '1.- IDENTIFICACIÓN DEL ESTUDIANTE',
        fields: [
          { rows: [
            { fields: [
              { label: 'Nombres', width: 220 },
              { label: 'Apellidos', width: 220 }
            ]},
            { fields: [
              { label: 'Fecha nacimiento', width: 70 },
              { label: 'Lugar nacimiento', width: 180 },
              { label: 'Sexo', width: 50 }
            ]},
            { fields: [
              { label: 'Nacionalidad', width: 100 },
              { label: 'Peso', width: 70 },
              { label: 'Talla', width: 70 }
            ]}
          ]}
        ]
      },
      {
        title: '2.- DATOS DEL REPRESENTANTE',
        fields: [
          { rows: [
            { fields: [
              { label: 'Nombres', width: 220 },
              { label: 'Apellidos', width: 220 }
            ]},
            { fields: [
              { label: 'Parentesco', width: 100 },
              { label: 'Cédula', width: 120 },
              { label: 'Teléfono', width: 120 }
            ]},
            { fields: [
              { label: 'Fecha nacimiento', width: 140 }
            ]}
          ]},
          { single: { label: 'Dirección', width: 440 }},
          { single: { label: 'Correo', width: 440 }}
        ]
      },
      // Las demás secciones seguirían el mismo patrón...
      {
        title: '9.- DESARROLLO',
        fields: [
          { rows: [
            { fields: [
              { label: 'Edad empezó caminar', width: 200 },
              { label: 'Edad empezó hablar', width: 200 }
            ]},
            { fields: [
              { label: 'Mano que utiliza', width: 200 }
            ]}
          ]},
          { single: { label: 'Enfermedades padecidas', width: 440, height: 20 }},
          { rows: [
            { fields: [
              { label: 'Tipo sangre y grupo', width: 200 }
            ]}
          ]}
        ]
      }
    ];

    // Generar todas las secciones
    sections.forEach(section => {
      createSection(section.title);
      
      section.fields.forEach(fieldType => {
        if (fieldType.rows) {
          fieldType.rows.forEach(row => {
            createFieldRow(row.fields);
          });
        } 
        else if (fieldType.single) {
          createSingleField(
            fieldType.single.label, 
            fieldType.single.width, 
            fieldType.single.height
          );
        }
      });
      
      doc.moveDown(0.5);
    });

    // Pie de página
    applyStyle(styles.fieldLabel);
    doc.text('DOCENTE'.padEnd(20) + 'REPRESENTANTE'.padEnd(20) + 'DIRECTORA', { 
      align: 'center' 
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).send('Error al generar el formulario');
  }
};