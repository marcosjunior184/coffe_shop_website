'use strict';

// load package
const express = require('express');
const bodyParser = require("body-Parser");
const { get, STATUS_CODES } = require('http');

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();
const axios = require('axios');
var mysql  = require('mysql');
const { json } = require('express');

var con = mysql.createConnection({
  host : 'localhost',
  user: 'root',
  database: 'mydb',
  password: 'Mad184'
});

con.connect(function(err){
  if (err) throw err;
  console.log("Connected");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) =>{
  res.sendFile(__dirname + "/html/root.html");
});


app.get('/postmessage', (req, res) => {
  res.sendFile(__dirname + "/html/posting.html");
});


app.post('/insert', (req,res) => {
  var topic = req.body.topic_input;
  var data = req.body.data;
  let time= new Date();

  var timestamp = time.getDate()+"/"+time.getMonth()+ "/" + " - "+ time.getHours() + ":" + time.getMinutes() ;

  var sql = "INSERT INTO post (Topic, Data, Timestamp) Values (" + JSON.stringify(topic) + ","+JSON.stringify(data)+","+JSON.stringify(timestamp)+");";

  con.query(sql, function(err, result){
    if (err) throw err;
    console.log("Inserted");
  });

  res.send();
});

app.post('/select', (req, res) => {

  var fieldType = req.body.type_of_field;
  var orderType = req.body.type_of_order;

  var sql = "SELECT * FROM post ORDER BY "+fieldType + " " + orderType + ";";
  con.query(sql, function(err, result, filds){
    if (err) throw err;
    res.send(result);
    });
});


app.use('/', express.static('html'));

app.listen(PORT, HOST);

console.log('up and running');
