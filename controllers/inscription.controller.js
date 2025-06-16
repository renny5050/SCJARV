const Student = require('../models/student.model.js');
const Person = require('../models/person.model.js');
const Tutor = require('../models/tutor.model.js');
const Father = require('../models/father.model.js');
const Mother = require('../models/mother.model.js');
const Emergen = require('../models/emergency.model.js');
const SocFam = require('../models/socfam.model.js');
const Pren = require('../models/antepren.model.js');
const Prob = require('../models/probnac.model.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generateStudentPDF = (req, res) => {
    try {
        // Obtener datos del estudiante (en producción vendrían de la base de datos)
        const studentData = {
            // ... tus datos JSON completos aquí ...
        };

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'A4',
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
        
        // Título
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fillColor('#1a237e')
           .text('FICHA DE INSCRIPCIÓN ESCOLAR', { align: 'center' })
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(12)
           .fillColor('#333')
           .text(`Código: ${studentData.cedula_escolar} | Fecha: ${studentData.fecha_inscripcion}`, { align: 'center' })
           .moveDown(1.5);

        // Datos del estudiante
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('I. DATOS DEL ESTUDIANTE')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#000')
           .text(`Nombre completo: ${studentData.primer_nombr} ${studentData.segundo_nomb || ''} ${studentData.primer_apell} ${studentData.segundo_apellido || ''}`);
        
        doc.text(`Fecha de nacimiento: ${studentData.fecha_nacimiento} | Sexo: ${studentData.sexo === 'M' ? 'Masculino' : 'Femenino'} | Nacionalidad: ${studentData.nacionalidad}`);
        
        doc.text(`Lugar de nacimiento: ${studentData.estado_nacimi}, ${studentData.municipio_nacimi}`);
        
        doc.text(`Tipo de sangre: ${studentData.grupo_sangui}${studentData.tip_sangrees} | Peso: ${studentData.peso_kg} kg | Talla: ${studentData.talla_m} m`);
        
        doc.text(`Procedencia: ${studentData.viene_promovido_de} | Institución anterior: ${studentData.institucion}`);
        doc.moveDown(1);

        // Datos del representante
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('II. DATOS DEL REPRESENTANTE')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(10)
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
           .fontSize(11)
           .text('Madre:')
           .moveDown(0.2);
        
        doc.font('Helvetica')
           .fontSize(10)
           .text(`Nombre: ${studentData.madre_primer_nombr} ${studentData.madre_segundo_nomb || ''} ${studentData.madre_primer_apell} ${studentData.madre_segundo_apell || ''}`);
        
        doc.text(`Cédula: ${studentData.madre_cedula} | Estado civil: ${studentData.madre_estado_civil} | Ocupación: ${studentData.madre_ocupacion}`);
        
        doc.text(`Teléfono: ${studentData.madre_telefono} | Email: ${studentData.madre_correo}`);
        
        doc.text(`Dirección: ${studentData.madre_direccion}`);
        doc.moveDown(0.5);

        // Padre
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .text('Padre:')
           .moveDown(0.2);
        
        doc.font('Helvetica')
           .fontSize(10)
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
           .fontSize(10)
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
           .fontSize(10)
           .text(`Número de niños: ${studentData.num_ninos} | Número de adultos: ${studentData.num_adultos}`);
        
        doc.text(`Tipo de vivienda: ${studentData.vivienda_caracteristicas} | Tenencia: ${studentData.vivienda_tenencia}`);
        doc.moveDown(1);

        // Antecedentes médicos
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .fillColor('#0d47a1')
           .text('VI. ANTECEDENTES MÉDICOS')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .fontSize(10)
           .text(`Enfermedades durante embarazo: ${studentData.enfermedades_madre_embarazo}`);
        
        doc.text(`Condiciones del parto: ${studentData.condiciones_parto} | Edad de la madre al parto: ${studentData.edad_madre_parto} años`);
        
        doc.text(`Peso al nacer: ${studentData.peso_nino} kg | Talla al nacer: ${studentData.talla_nino} m`);
        
        doc.text(`Edad al comenzar a hablar: ${studentData.edad_hablar} años | Edad al comenzar a caminar: ${studentData.edad_caminar} años`);
        
        doc.text(`Mano dominante: ${studentData.mano_utiliza} | Enfermedades padecidas: ${studentData.enfermedades_padecidas}`);
        
        // Firma y sello
        doc.moveDown(2);
        doc.font('Helvetica-Oblique')
           .fontSize(10)
           .text('_________________________', { align: 'right' })
           .text('Firma del Representante', { align: 'right' });
        
        doc.moveDown(0.5);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' });

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
        cas_telefono: ''
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
        cas_telefono: ''
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
        status_estud: true,  // Valor por defecto
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
// Controlador para inscripción (POST)
exports.postInscription = async (req, res) => {
  try {
    const data = req.body;

    // 1. Crear padres primero para poder comparar cédulas
    const dataPadre = mapearPadreAPersona(data);
    const padPersonaResult = await Person.crearPersona(dataPadre);
    const dataPadreTabla = { codigo_perso: padPersonaResult };
    const codigo_padre = await Father.crearPadreNino(dataPadreTabla);

    const dataMadre = mapearMadreAPersona(data);
    const madPersonaResult = await Person.crearPersona(dataMadre);
    const dataMadreTabla = { codigo_perso: madPersonaResult };
    const codigo_madre = await Mother.crearMadreNino(dataMadreTabla);

    // 2. Manejar representante (verificar si es uno de los padres)
    let repPersonResult, codigo_repre;
    const repCedula = data.rep_cedula;

    if (repCedula === data.padre_cedula) {
      // Representante es el padre
      repPersonResult = padPersonaResult;
      const dataRepTabla = { 
        codigo_perso: repPersonResult, 
        parentesco_r: data.parentesco_r 
      };
      codigo_repre = await Tutor.crearRepresentante(dataRepTabla);
    } 
    else if (repCedula === data.madre_cedula) {
      // Representante es la madre
      repPersonResult = madPersonaResult;
      const dataRepTabla = { 
        codigo_perso: repPersonResult, 
        parentesco_r: data.parentesco_r 
      };
      codigo_repre = await Tutor.crearRepresentante(dataRepTabla);
    } 
    else {
      // Representante es diferente, crear nueva persona
      const dataRep = mapearRepresentanteAPersona(data);
      repPersonResult = await Person.crearPersona(dataRep);
      const dataRepTabla = { 
        codigo_perso: repPersonResult, 
        parentesco_r: data.parentesco_r 
      };
      codigo_repre = await Tutor.crearRepresentante(dataRepTabla);
    }

    // 3. Crear contacto de emergencia (siempre se crea como nueva persona)
    const dataEmer = mapearEmergenciaAPersona(data);
    const emerPersonaResult = await Person.crearPersona(dataEmer);
    const dataEmerTabla = { codigo_perso: emerPersonaResult, parentesco_e: data.emer_parentesco };
    const cod_contEmer = await Emergen.crearContactoEmergencia(dataEmerTabla);

    // 4. Crear registros adicionales
    const dataSocFam = mapearAmbienteSociofamiliar(data);
    const cod_amSocFam = await SocFam.crearAmSocFam(dataSocFam);

    const dataPren = mapearAntecedentesPrenatales(data);
    const cod_antePren = await Pren.crearAntePren(dataPren);

    const dataProb = mapearProblemasNacimiento(data);
    const cod_probNace = await Prob.crearProblNac(dataProb);

    // 5. Preparar relaciones para el estudiante
    const relaciones = {
      codigo_repre,
      codigo_padre,
      codigo_madre,
      cod_contEmer,
      cod_amSocFam,
      cod_antePren,
      cod_probNace
    };

    // 6. Crear estudiante
    const dataEstud = mapearEstudiante(data, relaciones);
    console.log(dataEstud);
    const result = await Student.crearEstudiante(dataEstud);
    
    res.redirect('/inscripcion');
  } catch (error) {
    console.error('Error al procesar la inscripción:', error);
    res.status(500).send('Error interno del servidor');
  }
};