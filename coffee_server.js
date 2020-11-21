'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();
const mysql = require('mysql');
const {json} = require('express');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'coffeeshop',
    password: 'Mad184'
})

con.connect(function(err){
    if (err){
        throw err;
    }
    console.log('Connected');
})

app.use(bodyParser.urlencoded({ extended: true}));
app.use('/', express.static('views'));

app.get('/', (req, res) => {res.sendFile(__dirname + "/views/indesx.html")});

app.get('/stafflLogin', (req, res) => {res.sendFile(__dirname+ "/views/staffLogin.html")});

app.get('/clientLogin', (req, res) => {res.sendFile(__dirname + "/views/clientLogin.html")});

app.get('/clientLogon', (req, res) => {res.sendFile(__dirname + "/views/clientLogOn.html")});

app.get('/ClientPage', (req, res) => {res.sendFile(__dirname + "/views/")});


app.listen(PORT, HOST);
console.log("up and running");