'use strict'

const express = require('express');
const bodyParser = require('body-Parser');
const axios = require('axios');
const mysql =  require('mysql');

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();


// connect to mysql
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'cofeeshop',
    password: 'Mad184'
});

// connect
con.connect(function(err){
    if (err) {
        throw err;
    }
    console.log("Connect")
});

app.use('/', express.static('htmls'));
app.listen(PORT, HOST);
console.log('up and running');