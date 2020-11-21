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