const express = require('express');
const User = require('./controllers/user.controller.js');
const Inscription = require('./controllers/inscription.controller.js');
const Student = require('./controllers/student.controller.js');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

//RUTAS PARA EL SIDEBAR
app.get('/inscripcion', (req, res) => {
    res.render('inscription');
});

app.post('/inscripcion', Inscription.postInscription);

app.get('/donaciones', (req, res) => {
    res.render('donaciones');
});

app.get('/estudiantes', Student.Load);

app.get('/estudiante/:id', Student.ShowDetails);

app.get('/estudiante/:id/representante', Student.ShowTutor);

app.get('/estudiante/:id/madre', Student.ShowMother);

app.get('/estudiante/:id/padre', Student.ShowFather);

app.get('/estudiante/:id/emergencia', Student.ShowEmergen);

app.get('/estudiante/:id/ambiente', Student.ShowSocFam);

app.get('/estudiante/:id/nacimiento', Student.ShowProbNac);

app.get('/estudiante/:id/prenatal', Student.ShowAntePren);

app.get('/test', User.testUsers);

// Ruta POST para crear un nuevo usuario
app.post('/test', User.createUser); // ✅ Nueva ruta POST

app.get('/users/pdftest', User.generateEnrollmentForm);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});