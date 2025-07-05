const Estudiante = require('../models/estudiante.model.js');
const Persona = require('../models/persona.model.js');
const Repre = require('../models/representante.model.js');
const Padre = require('../models/padre.model.js');
const Madre = require('../models/madre.model.js');
const Emergen = require('../models/contactoEmergencia.model.js');
const SocFam = require('../models/ambienteSociofamiliar.model.js');
const Prenat = require('../models/antecedentePrenatal.js');
const Prob = require('../models/problemasNacimiento.model.js');
const EstudianSeccion = require('../models/studentsection.model.js');
const Seccion = require('../models/section.model.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const obtenerInscripcionCompleta = async (cedulaEscolar) => {
    try {
        // 1. Obtener datos básicos del estudiante
        const estudiante = await Estudiante.obtenerEstudianteCedula(cedulaEscolar);
        if (!estudiante) return null;

        const seccionData = await EstudianSeccion.obtenerUltimaInscripcionPorEstudiante(estudiante.codigo_estud)

        console.log('Datos seccion:', seccionData);

        // 2. Obtener datos relacionados en paralelo
        const [
            padre, madre, representante, emergencia,
            ambienteSocio, antecedentesPren, problemasNac, SeccionQuerry
        ] = await Promise.all([
            Padre.obtenerPadreNino(estudiante.codigo_padre),
            Madre.obtenerMadreNino(estudiante.codigo_madre),
            Repre.obtenerRepresentante(estudiante.codigo_repre),
            Emergen.obtenerContactoEmergencia(estudiante.cod_contEmer),
            SocFam.obtenerAmSocFam(estudiante.cod_amSocFam),
            Prenat.obtenerAntePren(estudiante.cod_antePren),
            Prob.obtenerProblNac(estudiante.cod_probNace),
            seccionData ? Seccion.obtenerSeccion(seccionData.cod_anoSecci) : {nombre_secci: "No asignada", codigo_secci: null}
        ]);

        console.log('Prob:', problemasNac);

        // 3. Obtener datos de personas asociadas
        const [
            personaPadre, personaMadre, 
            personaRepresentante, personaEmergencia
        ] = await Promise.all([
            Persona.obtenerPersona(padre.codigo_perso),
            Persona.obtenerPersona(madre.codigo_perso),
            Persona.obtenerPersona(representante.codigo_perso),
            Persona.obtenerPersona(emergencia.codigo_perso)
        ]);

        console.log('Datos en función del representante:', personaRepresentante);

        // 4. Construir y retornar objeto unificado
        return {
            // Datos del estudiante
            ...estudiante,
            
            // Datos del padre
            padre_cedula: personaPadre.cedula,
            padre_primer_nombr: personaPadre.primer_nombr,
            padre_segundo_nomb: personaPadre.segundo_nomb,
            padre_primer_apell: personaPadre.primer_apell,
            padre_segundo_apell: personaPadre.segund_apell,
            padre_fecha_nacimiento: personaPadre.fech_nacimie,
            padre_nacionalidad: personaPadre.nacionalidad,
            padre_correo: personaPadre.correo_perso,
            padre_direccion: personaPadre.direcc_perso,
            padre_telefono: personaPadre.prin_telefono,
            padre_estado_civil: personaPadre.estado_civil,
            padre_ocupacion: personaPadre.ocupacion_p,

            // ... resto de campos del padre (mantener misma estructura que en subirInscripcion)
            
            // Datos de la madre
            madre_cedula: personaMadre.cedula,
            madre_primer_nombr: personaMadre.primer_nombr,
            madre_segundo_nomb: personaMadre.segundo_nomb,
            madre_primer_apell: personaMadre.primer_apell,
            madre_segundo_apell: personaMadre.segund_apell,
            madre_fecha_nacimiento: personaMadre.fech_nacimie,
            madre_nacionalidad: personaMadre.nacionalidad,
            madre_correo: personaMadre.correo_perso,
            madre_direccion: personaMadre.direcc_perso,
            madre_telefono: personaMadre.prin_telefono,
            madre_estado_civil: personaMadre.estado_civil,
            madre_ocupacion: personaMadre.ocupacion_p,

            // ... resto de campos de la madre
            
            // Datos del representante
            rep_cedula: personaRepresentante.cedula,
            rep_primer_nombr: personaRepresentante.primer_nombr,
            rep_segundo_nomb: personaRepresentante.segundo_nomb,
            rep_primer_apell: personaRepresentante.primer_apell,
            rep_segund_apell: personaRepresentante.segund_apell,
            rep_fecha_nacimiento: personaRepresentante.fech_nacimie,
            rep_email: personaRepresentante.correo_perso,
            rep_direccion: personaRepresentante.direcc_perso,
            rep_telefono: personaRepresentante.prin_telefono,
            parentesco_r: representante.parentesco_r,
            // ... resto de campos del representante
            
            // Contacto de emergencia
            emer_cedula: personaEmergencia.cedula,
            emer_primer_nombre: personaEmergencia.primer_nombr,
            emer_segundo_nombre: personaEmergencia.segundo_nomb,
            emer_primer_apellido: personaEmergencia.primer_apell,
            emer_segundo_apellido: personaEmergencia.segund_apell,
            emer_parentesco: emergencia.parentesco_e,
            emer_telefono: personaEmergencia.prin_telefono,
            emer_direccion: personaEmergencia.direcc_perso,
            emer_nacionalidad: personaEmergencia.nacionalidad,

            // ... resto de campos de emergencia
            
            // Datos complementarios
            ...ambienteSocio,
            ...antecedentesPren,
            ...problemasNac,
            // Datos de la sección
            ...SeccionQuerry
        };
        
    } catch (error) {
        console.error('Error interno al obtener datos completos:', error);
        throw error; // Relanza el error para manejo superior
    }
};

exports.generarPDF = async (req, res) => {
    try {
        // Obtener datos completos del estudiante
        const studentData = await obtenerInscripcionCompleta(req.params.cedulaEscolar);
        console.log('Datos del estudiante:', studentData);
        
        if (!studentData) {
            return res.status(404).send('Estudiante no encontrado');
        }

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'legal',
            margin: 30,
            layout: 'portrait',
            info: {
                Title: `Ficha de Estudiante - ${studentData.primer_nombr} ${studentData.primer_apell}`,
                Author: 'Sistema Escolar',
                CreationDate: new Date()
            }
        });

        // Configurar respuesta HTTP
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ficha_${studentData.cedula_escolar}.pdf"`);
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);

        // --- CONTENIDO DEL PDF ---
        
// Título con recuadros

const logoPath = __dirname + '/../assets/images/Logo.png'; // Ruta absoluta basada en la estructura del proyecto
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

const titleY = doc.y; // Guardamos la posición Y actual
// Agregar nombre de la institución arriba del título
doc.font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#1a237e')
    .text('CENTRO DE EDUCACIÓN INICIAL SIMONCITO', { align: 'center' })
    .text('"J.A. ROMÁN VALECILLOS"', { align: 'center' })
    .text('SAN CRISTÓBAL', { align: 'center' })
    .text('ESTADO TÁCHIRA', { align: 'center' })
    .moveDown(0.3);

const titleText = 'FICHA DE INSCRIPCIÓN ESCOLAR';

// Primero dibujamos el título centrado
doc.font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#1a237e')
    .text(titleText, { align: 'center' });

const titleWidth = doc.widthOfString(titleText);
const pageCenter = doc.page.width / 2;
const titleEndX = pageCenter + (titleWidth / 2) + 10;
const marginRight = 50; // Margen derecho
const boxSpacing = 5; // Espacio entre recuadros

// AUMENTAMOS EL TAMAÑO DE LOS RECUADROS
const boxWidth = 75;  // Aumentamos de 30 a 40
const boxHeight = 85; // Aumentamos de 20 a 30

// Posición X de los recuadros (a la derecha del título)
const boxX1 = titleEndX + boxSpacing;
const boxX2 = boxX1 + boxWidth + boxSpacing;

// Ajustamos la posición Y para centrar verticalmente los recuadros con el texto
// Esto es importante porque al aumentar la altura, necesitamos centrarlos con el texto
const boxY = titleY - (boxHeight - doc.currentLineHeight()) / 2;

// Dibujamos los recuadros con las nuevas dimensiones
doc.rect(boxX1, boxY, boxWidth, boxHeight).stroke();
doc.rect(boxX2, boxY, boxWidth, boxHeight).stroke();


// Continuamos con el resto del contenido
doc.moveDown(0.5);
doc.font('Helvetica')
   .fontSize(13)
   .fillColor('#333')
   .text(`Código: ${studentData.cedu_escolar} | Fecha: ${studentData.fecha_inscripcion}`, { align: 'center' })
   .moveDown(1.5);

        // Datos del estudiante
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('I. DATOS DEL ESTUDIANTE')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(13)
           .fillColor('#000')
           .text(`Nombre completo: ${studentData.primer_nombr} ${studentData.segundo_nomb || ''} ${studentData.primer_apell} ${studentData.segundo_apellido || ''}`);
        
        doc.text(`Fecha de nacimiento: ${studentData.fecha_nacimiento} | Sexo: ${studentData.sexo === 'M' ? 'Masculino' : 'Femenino'} | Nacionalidad: ${studentData.nacionalidad}`);
        
        doc.text(`Lugar de nacimiento: ${studentData.estad_nacimi}, ${studentData.munic_nacimi}`);
        
        // Manejo correcto del tipo de sangre (RH)
        const rh = studentData.tip_sangrees ? '+' : '-';
        doc.text(`Tipo de sangre: ${studentData.grupo_sangui}${rh} | Peso: ${studentData.peso_kg} kg | Talla: ${studentData.tall_cm} m`);
        
        doc.text(`Procedencia: ${studentData.nombre_secci} | Institución anterior: ${studentData.institucion}`);
        doc.moveDown(1);

        // Datos del representante
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('II. DATOS DEL REPRESENTANTE')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Nombre completo: ${studentData.rep_primer_nombr} ${studentData.rep_segundo_nomb || ''} ${studentData.rep_primer_apell} ${studentData.rep_segund_apell || ''}`);
        
        doc.text(`Cédula: ${studentData.rep_cedula} | Parentesco: ${studentData.parentesco_r} | Fecha nacimiento: ${studentData.rep_fecha_nacimiento}`);
        
        doc.text(`Teléfono: ${studentData.rep_telefono} | Email: ${studentData.rep_email}`);
        
        doc.text(`Dirección: ${studentData.rep_direccion}`);
        doc.moveDown(1);

        // Datos de los padres
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('III. DATOS DE LOS PADRES')
           .moveDown(0.5);
        
        // Madre
        doc.font('Helvetica-Bold')
           .fontSize(13)
           .text('Madre:')
           .moveDown(0.2);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Nombre: ${studentData.madre_primer_nombr} ${studentData.madre_segundo_nomb || ''} ${studentData.madre_primer_apell} ${studentData.madre_segundo_apell || ''}`);
        
        doc.text(`Cédula: ${studentData.madre_cedula} | Estado civil: ${studentData.madre_estado_civil} | Ocupación: ${studentData.madre_ocupacion}`);
        
        doc.text(`Teléfono: ${studentData.madre_telefono} | Email: ${studentData.madre_correo}`);
        
        doc.text(`Dirección: ${studentData.madre_direccion}`);
        doc.moveDown(0.5);

        // Padre
        doc.font('Helvetica-Bold')
           .fontSize(13)
           .text('Padre:')
           .moveDown(0.2);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Nombre: ${studentData.padre_primer_nombr} ${studentData.padre_segundo_nomb || ''} ${studentData.padre_primer_apell} ${studentData.padre_segundo_apell || ''}`);
        
        doc.text(`Cédula: ${studentData.padre_cedula} | Estado civil: ${studentData.padre_estado_civil} | Ocupación: ${studentData.padre_ocupacion}`);
        
        doc.text(`Teléfono: ${studentData.padre_telefono} | Email: ${studentData.padre_correo}`);
        
        doc.text(`Dirección: ${studentData.padre_direccion}`);
        doc.moveDown(1);

        // Contacto de emergencia
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('IV. CONTACTO DE EMERGENCIA')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Nombre: ${studentData.emer_primer_nombre} ${studentData.emer_segundo_nombre || ''} ${studentData.emer_primer_apellido} ${studentData.emer_segundo_apellido || ''}`);
        
        doc.text(`Cédula: ${studentData.emer_cedula} | Edad: ${studentData.emer_edad} | Parentesco: ${studentData.emer_parentesco}`);
        
        doc.text(`Ocupación: ${studentData.emer_ocupacion} | Teléfono: ${studentData.emer_telefono}`);
        
        doc.text(`Dirección: ${studentData.emer_direccion}`);
        doc.moveDown(1);

        // Ambiente familiar
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('V. AMBIENTE FAMILIAR')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Número de niños: ${studentData.numero_ninos} | Número de adultos: ${studentData.nume_adultos}`);
        
        doc.text(`Tipo de vivienda: ${studentData.tip_caracter} | Tenencia: ${studentData.tip_tenencia}`);
        doc.moveDown(1);

        // Antecedentes médicos
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('VI. ANTECEDENTES MÉDICOS')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(13)
           .text(`Enfermedades durante embarazo: ${studentData.enfe_madreEm}`);
        
        doc.text(`Condiciones del parto: ${studentData.cod_codiPart} | Edad de la madre al parto: ${studentData.edad_maParto} años`);
        
        doc.text(`Peso al nacer: ${studentData.peso_ninoNac} kg | Talla al nacer: ${studentData.tall_ninoNac} cm`);
        
        doc.text(`Edad al comenzar a hablar: ${studentData.edad_nhablar} años | Edad al comenzar a caminar: ${studentData.edad_caminar} años`);
        
        doc.text(`Mano dominante: ${studentData.mano_dominan} | Enfermedades padecidas: ${studentData.cod_enfePade}`);
        
        // Espacio antes de las firmas
doc.moveDown(1.5);

// Obtener posición Y actual para alinear todas las firmas
const startY = doc.y;
const columnWidth = (doc.page.width - 60) / 4; // 4 firmas en lugar de 3
const lineHeight = 15;

// Primera firma (Representante)
doc.font('Helvetica-Oblique')
   .fontSize(13)
   .text('________________', 30, startY, { align: 'center', width: columnWidth })
   .text('Firma del Representante', 30, startY + lineHeight, { align: 'center', width: columnWidth });

// Segunda firma (Docente)
doc.font('Helvetica-Oblique')
   .fontSize(13)
   .text('________________', 30 + columnWidth, startY, { align: 'center', width: columnWidth })
   .text('Firma Docente', 30 + columnWidth, startY + lineHeight, { align: 'center', width: columnWidth });

// Tercera firma (Docente)
doc.font('Helvetica-Oblique')
   .fontSize(13)
   .text('________________', 30 + 2 * columnWidth, startY, { align: 'center', width: columnWidth })
   .text('Firma Docente', 30 + 2 * columnWidth, startY + lineHeight, { align: 'center', width: columnWidth });

// Cuarta firma (Directora)
doc.font('Helvetica-Oblique')
   .fontSize(13)
   .text('________________', 30 + 3 * columnWidth, startY, { align: 'center', width: columnWidth })
   .text('Firma Directora', 30 + 3 * columnWidth, startY + lineHeight, { align: 'center', width: columnWidth });

// Fecha generada
doc.moveDown(2); // Espacio después de las firmas
doc.font('Helvetica-Oblique')
    .fontSize(13)
    .text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' });

// Finalizar documento
doc.end();

        

    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).send('Error al generar el documento PDF');
    }
};

function mapearRepresentanteAPersona(body) {
    return {
        primer_nombr: body.rep_primer_nombr || '',
        segundo_nomb: body.rep_segundo_nomb || '',
        primer_apell: body.rep_primer_apell || '',
        segund_apell: body.rep_segund_apell || '',
        cedula_perso: body.rep_cedula || '',
        cedula: body.rep_cedula || '',  // Mismo valor que cedula_perso
        fech_nacimie: body.rep_fecha_nacimiento || '',
        nacionalidad: '',  // Valor por defecto (no viene en el JSON)
        correo_perso: body.rep_email || '',
        direcc_perso: body.rep_direccion || '',
        status_perso: true,  // Valor por defecto
        prin_telefono: body.rep_telefono || '',
        sec_telefono: '',  // Valor por defecto
        cas_telefono: ''   // Valor por defecto
    };
}

function mapearPadreAPersona(body) {
    return {
        primer_nombr: body.padre_primer_nombr || '',
        segundo_nomb: body.padre_segundo_nomb || '',
        primer_apell: body.padre_primer_apell || '',
        segund_apell: body.padre_segundo_apell || '',
        cedula_perso: body.padre_cedula || '',
        cedula: body.padre_cedula || '',
        fech_nacimie: body.padre_fecha_nacimiento || '',
        nacionalidad: body.padre_nacionalidad || '',
        correo_perso: body.padre_correo || '',
        direcc_perso: body.padre_direccion || '',
        status_perso: true,
        prin_telefono: body.padre_telefono || '',
        sec_telefono: '',
        cas_telefono: '',
        estado_civil: body.padre_estado_civil || '',
        ocupacion_p: body.padre_ocupacion || ''
    };
}

function mapearMadreAPersona(body) {
    return {
        primer_nombr: body.madre_primer_nombr || '',
        segundo_nomb: body.madre_segundo_nomb || '',
        primer_apell: body.madre_primer_apell || '',
        segund_apell: body.madre_segundo_apell || '',
        cedula_perso: body.madre_cedula || '',
        cedula: body.madre_cedula || '',
        fech_nacimie: body.madre_fecha_nacimiento || '',
        nacionalidad: body.madre_nacionalidad || '',
        correo_perso: body.madre_correo || '',
        direcc_perso: body.madre_direccion || '',
        status_perso: true,
        prin_telefono: body.madre_telefono || '',
        sec_telefono: '',
        cas_telefono: '',
        estado_civil: body.madre_estado_civil || '',
        ocupacion_p: body.madre_ocupacion || ''
    };
}
function mapearProblemasNacimiento(body) {
    return {
        edad_nhablar: body.edad_hablar ? parseInt(body.edad_hablar) : null,
        edad_caminar: body.edad_caminar ? parseInt(body.edad_caminar) : null,
        mano_dominan: body.mano_utiliza || '',
        cod_enfePade: body.enfermedades_padecidas || ''
    };
}

function mapearEmergenciaAPersona(body) {
    return {
        primer_nombr: body.emer_primer_nombre || '',
        segundo_nomb: body.emer_segundo_nombre || '',
        primer_apell: body.emer_primer_apellido || '',
        segund_apell: body.emer_segundo_apellido || '',
        cedula_perso: body.emer_cedula || '',
        cedula: body.emer_cedula || '',
        fech_nacimie: '',  // No disponible en el formulario
        nacionalidad: body.emer_nacionalidad || '',
        correo_perso: '',  // No disponible en el formulario
        direcc_perso: body.emer_direccion || '',
        status_perso: true,
        prin_telefono: body.emer_telefono || '',
        sec_telefono: '',
        cas_telefono: ''
    };
}

function mapearAmbienteSociofamiliar(body) {
    return {
        pers_amSoFam: null,  // Este campo no está en el formulario
        numero_ninos: body.num_ninos ? parseInt(body.num_ninos) : 0,
        nume_adultos: body.num_adultos ? parseInt(body.num_adultos) : 0,
        tip_caracter: body.vivienda_caracteristicas || '',
        tip_tenencia: body.vivienda_tenencia || ''
    };
}

function mapearAntecedentesPrenatales(body) {
    return {
        enfe_madreEm: body.enfermedades_madre_embarazo || '',
        cod_codiPart: body.condiciones_parto || '',
        edad_maParto: body.edad_madre_parto ? parseInt(body.edad_madre_parto) : null,
        peso_ninoNac: body.peso_nino ? parseFloat(body.peso_nino) : null,
        tall_ninoNac: body.talla_nino ? parseFloat(body.talla_nino) : null,
        medi_contPre: ''  // Valor por defecto ya que no está en el formulario
    };
}

function mapearProblemasNacimiento(body) {
    return {
        edad_nhablar: body.edad_hablar ? parseInt(body.edad_hablar) : null,
        edad_caminar: body.edad_caminar ? parseInt(body.edad_caminar) : null,
        mano_dominan: body.mano_utiliza || '',
        cod_enfePade: body.enfermedades_padecidas || ''
    };
}

function mapearEstudiante(body, relaciones) {
    return {
        primer_nombr: body.primer_nombr || '',
        segundo_nomb: body.segundo_nomb || '',
        primer_apell: body.primer_apell || '',
        segundo_apellido: body.segundo_apellido || '',
        fecha_nacimiento: body.fecha_nacimiento || '',
        sexo: body.sexo || '',
        nacionalidad: body.nacionalidad || '',
        tip_sangrees: body.tip_sangrees === '+',  // Convertir a booleano
        grupo_sangui: body.grupo_sangui || '',
        estad_nacimi: body.estad_nacimi || '',
        munic_nacimi: body.munic_nacimi || '',
        cedu_escolar: body.cedu_escolar || '',
        tall_cm: body.tall_cm || '',
        fecha_inscripcion: body.fecha_inscripcion || new Date().toISOString().split('T')[0], // Fecha actual por defecto
        status_estud: true, 
        peso_kg: body.peso_kg || '', // Valor por defecto
        // Campos de relaciones (se proporcionan externamente)
        codigo_repre: relaciones.codigo_repre,
        codigo_padre: relaciones.codigo_padre,
        codigo_madre: relaciones.codigo_madre,
        cod_contEmer: relaciones.cod_contEmer,
        cod_amSocFam: relaciones.cod_amSocFam,
        cod_antePren: relaciones.cod_antePren,
        cod_probNace: relaciones.cod_probNace
    };
}

// Controlador para inscripción (POST) con verificación de cédulas
// ... (código anterior sin cambios)

// Controlador para inscripción (POST) con cédula escolar autogenerada
exports.subirInscripcion = async (req, res) => {
  try {
    const data = req.body;

    // 1. Verificar y crear/manejar padre
    let codigo_perso_padre;
    const padreExistente = await Persona.obtenerPersonaPorCedula(data.padre_cedula);
    if (padreExistente) {
      codigo_perso_padre = padreExistente.codigo_perso;
      console.log(`Padre encontrado con cédula ${data.padre_cedula}, ID: ${codigo_perso_padre}`);
    } else {
      const dataPadre = mapearPadreAPersona(data);
      codigo_perso_padre = await Persona.crearPersona(dataPadre);
      console.log(`Nuevo padre creado con ID: ${codigo_perso_padre}`);
    }

    // Verificar si ya está registrado como padre
    let codigo_padre;
    const padreRegistrado = await Padre.obtenerPadrePorPersona(codigo_perso_padre);
    if (padreRegistrado) {
      codigo_padre = padreRegistrado.codigo_padre;
      console.log(`Padre ya registrado en Tb_padres con ID: ${codigo_padre}`);
    } else {
      const dataPadreTabla = { codigo_perso: codigo_perso_padre };
      codigo_padre = await Padre.crearPadreNino(dataPadreTabla);
      console.log(`Nuevo registro de padre creado en Tb_padres con ID: ${codigo_padre}`);
    }

    // 2. Verificar y crear/manejar madre
    let codigo_perso_madre;
    const madreExistente = await Persona.obtenerPersonaPorCedula(data.madre_cedula);
    if (madreExistente) {
      codigo_perso_madre = madreExistente.codigo_perso;
      console.log(`Madre encontrada con cédula ${data.madre_cedula}, ID: ${codigo_perso_madre}`);
    } else {
      const dataMadre = mapearMadreAPersona(data);
      codigo_perso_madre = await Persona.crearPersona(dataMadre);
      console.log(`Nueva madre creada con ID: ${codigo_perso_madre}`);
    }

    // Verificar si ya está registrada como madre
    let codigo_madre;
    const madreRegistrada = await Madre.obtenerMadrePorPersona(codigo_perso_madre);
    if (madreRegistrada) {
      codigo_madre = madreRegistrada.codigo_madre;
      console.log(`Madre ya registrada en Tb_madres con ID: ${codigo_madre}`);
    } else {
      const dataMadreTabla = { codigo_perso: codigo_perso_madre };
      codigo_madre = await Madre.crearMadreNino(dataMadreTabla);
      console.log(`Nuevo registro de madre creado en Tb_madres con ID: ${codigo_madre}`);
    }

    // 3. Manejar representante (verificar si es padre o madre o nuevo)
    let repPersonResult;
    const repCedula = data.rep_cedula;

    if (repCedula === data.padre_cedula) {
      // Representante es el padre
      repPersonResult = codigo_perso_padre;
      console.log(`Representante es el padre (ID: ${repPersonResult})`);
    } else if (repCedula === data.madre_cedula) {
      // Representante es la madre
      repPersonResult = codigo_perso_madre;
      console.log(`Representante es la madre (ID: ${repPersonResult})`);
    } else {
      // Representante es diferente, verificar si ya existe
      const repExistente = await Persona.obtenerPersonaPorCedula(repCedula);
      if (repExistente) {
        repPersonResult = repExistente.codigo_perso;
        console.log(`Representante encontrado con cédula ${repCedula}, ID: ${repPersonResult}`);
      } else {
        const dataRep = mapearRepresentanteAPersona(data);
        repPersonResult = await Persona.crearPersona(dataRep);
        console.log(`Nuevo representante creado con ID: ${repPersonResult}`);
      }
    }

    // Verificar si ya está registrado como representante
    let codigo_repre;
    const representanteRegistrado = await Repre.obtenerRepresentantePorPersona(repPersonResult);
    if (representanteRegistrado) {
      codigo_repre = representanteRegistrado.codigo_repre;
      console.log(`Representante ya registrado en Tb_represent con ID: ${codigo_repre}`);
    } else {
      const dataRepTabla = { 
        codigo_perso: repPersonResult, 
        parentesco_r: data.parentesco_r 
      };
      codigo_repre = await Repre.crearRepresentante(dataRepTabla);
      console.log(`Nuevo registro de representante creado en Tb_represent con ID: ${codigo_repre}`);
    }

    // 4. Verificar y crear/manejar contacto de emergencia
    let emerPersonaResult;
    const emerExistente = await Persona.obtenerPersonaPorCedula(data.emer_cedula);
    if (emerExistente) {
      emerPersonaResult = emerExistente.codigo_perso;
      console.log(`Contacto emergencia encontrado con cédula ${data.emer_cedula}, ID: ${emerPersonaResult}`);
    } else {
      const dataEmer = mapearEmergenciaAPersona(data);
      emerPersonaResult = await Persona.crearPersona(dataEmer);
      console.log(`Nuevo contacto emergencia creado con ID: ${emerPersonaResult}`);
    }
    const dataEmerTabla = { codigo_perso: emerPersonaResult, parentesco_e: data.emer_parentesco };
    const cod_contEmer = await Emergen.crearContactoEmergencia(dataEmerTabla);

    // 5. Crear registros adicionales
    const dataSocFam = mapearAmbienteSociofamiliar(data);
    const cod_amSocFam = await SocFam.crearAmSocFam(dataSocFam);

    const dataPren = mapearAntecedentesPrenatales(data);
    const cod_antePren = await Prenat.crearAntePren(dataPren);

    const dataProb = mapearProblemasNacimiento(data);
    const cod_probNace = await Prob.crearProblNac(dataProb);

    // 6. Preparar relaciones para el estudiante
    const relaciones = {
      codigo_repre,
      codigo_padre,
      codigo_madre,
      cod_contEmer,
      cod_amSocFam,
      cod_antePren,
      cod_probNace
    };

    // 7. Generar cédula escolar automáticamente
    const fechaNacimiento = new Date(data.fecha_nacimiento);
    const anioNacimiento = fechaNacimiento.getFullYear();
    const ultimosDosDigitosAnio = anioNacimiento.toString().slice(-2);
    
    const estudiantesMismoAnio = await Estudiante.obtenerEstudiantesPorRepresentanteYAnio(
      codigo_repre, 
      anioNacimiento
    );
    
    const secuencia = estudiantesMismoAnio.length + 1;
    const cedulaEscolarGenerada = `${secuencia}${ultimosDosDigitosAnio}${data.rep_cedula}`;
    data.cedu_escolar = cedulaEscolarGenerada;

    // 8. Crear estudiante con cédula generada
    const dataEstud = mapearEstudiante(data, relaciones);
    const result = await Estudiante.crearEstudiante(dataEstud);
    
    console.log(`Estudiante creado con ID: ${result.lastID}, Cédula escolar: ${cedulaEscolarGenerada}`);
    
    res.redirect('/inscripcionexitosa/' + dataEstud.cedu_escolar);
  } catch (error) {
    console.error('Error al procesar la inscripción:', error);
    res.status(500).send('Error interno del servidor: ' + error.message);
  }
};

// ... (código posterior sin cambios)

exports.inscripcionExitosa = (req, res) => {
    const cedulaEscolar = req.params.cedulaEscolar;
    res.render('page-inscripcion-exitosa', { cedulaEscolar });
}