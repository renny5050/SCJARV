const express = require('express');
const inscripcion = require('./controllers/inscripcion.controller.js');
const estudiante = require('./controllers/estudiante.controller.js');
const seccion = require('./controllers/seccion.controller.js');
const anioSeccion = require('./controllers/anioSeccion.controller.js');
const estudianteSeccion = require('./controllers/estudianteSeccion.controller.js');
const docente = require('./controllers/docente.controller.js');
const representante = require('./controllers/representantes.controller.js');
const colaboracion = require('./controllers/colab.controller.js');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

//RUTAS PARA EL SIDEBAR

app.get('/datos', estudiante.contarEstudiantesPorGenero);

app.get('/', (req, res) => {
    res.redirect('/inscripcion');
});

app.get('/inscripcion', (req, res) => {
    res.render('page-inscripcion');
});

app.post('/inscripcion', inscripcion.subirInscripcion);

app.get('/inscripcionexitosa/:cedulaEscolar', inscripcion.inscripcionExitosa);

app.get('/pdf/:cedulaEscolar', inscripcion.generarPDF);

app.get('/estudiantes', estudiante.cargarEstudiantes);

app.get('/estudiantes/buscar/', estudiante.buscarEstudiantePorCedula);

app.get('/estudiante/:id', estudiante.detallesEstudiante);

app.get('/estudiante/:id/representante', estudiante.detallesRepresentante);

app.get('/estudiante/:id/madre', estudiante.detallesMadre);

app.get('/estudiante/:id/padre', estudiante.detallesPadre);

app.get('/estudiante/:id/emergencia', estudiante.detallesEmergencia);

app.get('/estudiante/:id/ambiente', estudiante.detallesSocioFamiliar);

app.get('/estudiante/:id/nacimiento', estudiante.detallesProblemasNacimiento);

app.get('/estudiante/:id/prenatal', estudiante.detallesAntecedentesPrenatales);

app.get('/secciones', seccion.listarSecciones);

app.get('/secciones/:cedulaEscolar', seccion.listarSecciones);

app.post('/secciones', seccion.crearSeccion);

app.post('/secciones/:id/eliminar', seccion.eliminarSeccion);

app.post('/seccion/:id', anioSeccion.crearAnoSeccion);

app.post('/seccion/:id/eliminar', anioSeccion.eliminarAnoSeccion);

app.get('/seccion/:id', anioSeccion.listarAnoSeccion);

app.get('/seccion/:id/:cedulaEscolar', anioSeccion.listarAnoSeccion);

app.get('/cursantes/:id', estudianteSeccion.mostrarInscripciones);

// app.post('/cursantes/agregar/', estudianteSeccion.inscribirEstudianteRedireccion);

app.post('/cursantes/:id/agregar', estudianteSeccion.inscribirEstudiante);

app.get('/cursantes/:id/:cedulaEscolar', estudianteSeccion.inscribirEstudianteEnlace);

app.get('/docentes', docente.listarDocentes);

app.post('/docentes', docente.crearDocente);

app.post('/docentes/:id/borrar', docente.eliminarDocente);

app.get('/representantes', representante.cargarRepresentantes);

app.post('/representantes/buscar', representante.buscarRepresentantePorCedula);

app.get('/representante/:id', representante.detallesRepresentante);

app.get('/colaboraciones', colaboracion.cargarPagina);

app.post('/colaboraciones', colaboracion.crearColaboracion);

app.post('/colaboraciones/:id', colaboracion.eliminarColaboracion);



app.listen(port, () => {
    console.log(`Server ejecutándose en: http://localhost:${port}/`);
});