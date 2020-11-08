'use strict'

const express = require('express');
const bodyParser = require('body-Parser');
const axios = require('axios');
const mysql =  require('mysql');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');


const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();


app.use('/views', express(__dirname + '/views'));
app.use(express.static('images'));
app.use('/image', express.static(__dirname + '/images'));
app.use(express.static('CSS'));
app.use('/CSS', express.static(__dirname + '/CSS'));
app.use(expressLayouts);

// Set a view engine
app.set('views', path.join(__dirname+"/views"));
app.set('view engine', 'ejs');
app.set('layout', __dirname + '/views/layout');

// connect to mysql
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'coffeeshop',
    password: 'Mad184'
});

// connect
con.connect(function(err){
    if (err) {
        throw err;
    }
    console.log("Connect")
});

app.get('/', (req, res) => {res.render('index')});
app.get('/login', longIn);
app.get('/menu', menu);
app.get('/menuData', getMenuData)

async function longIn(req, res){
    res.render('login');
}
async function menu(req, res){
    res.render('menu')
}

async function getMenuData(req, res){
    var sql = "SELECT * FROM customers"
    con.query(sql, function(err, result, filds){
        res.send(result);
    });
}

app.use('/', express.static('views'));

app.listen(PORT, HOST);
console.log('up and running');
