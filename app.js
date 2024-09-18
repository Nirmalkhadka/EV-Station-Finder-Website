const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path =require('path');

//setting up the views for the pug file
app.set('view engine', 'pug');
app.set('views', 'views');

//middlerware to parse the body of the request
app.use(bodyParser.urlencoded({extended: true}));

//middlerware to serve the static files
app.use(express.static(path.join(__dirname, 'Public')));


// Serve static files from the 'imgs' directory
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));

// // Serve the index.html file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'view', 'index.html'));
// });


const usrRts = require('./routes/userRoutes.js');

app.use(usrRts);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(result=>{
        app.listen(process.env.PORT);
    })
    .catch(err=>{
        console.log(err);
    })