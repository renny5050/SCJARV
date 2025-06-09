const express = require('express');
const User = require('./controllers/user.controller.js');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/assets', express.static('assets'));
app.use('/css', express.static('css'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { message: 'Hello, Express 4.17!' });
});

app.get('/inscripcion', (req, res) => {
    res.render('inscription');
});

app.get('/test', User.testUsers);

// Ruta POST para crear un nuevo usuario
app.post('/test', User.createUser); // ✅ Nueva ruta POST

app.get('/users/pdftest', User.generateEnrollmentForm);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});