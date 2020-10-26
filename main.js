'use strict';

// load package
const express = require('express');
const bodyParser = require("body-Parser");
const fs = require('fs');
const { get, STATUS_CODES } = require('http');

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();
 
const PATH = __dirname + "/html/";

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) =>{
  res.sendFile(__dirname + "/html/root.html");
});

app.get('/postmessage/', (req, res) => {
  res.sendFile(__dirname + "/html/posting.html");
});



app.set('view engine', 'html');

app.post('/postmessage', (req,res) => {

  console.log(req.body);

  var topic = req.body.topic_input;
  var data = req.body.data;
  let time= new Date();

  var Hours = "Time - " + time.getHours() + ":" + time.getMinutes() ;
  var Day = "Date - " + time.getDate()+"/"+time.getMonth();

  var aPOst = Day + " -" + Hours + "\nTopic - " + topic + "\n" + data;

  
  fs.writeFile('html/' + "post.txt", aPOst + "\n",{ flag: 'a+' }, err => {
    if (err){
      console.error(err)
      return
    }
    fs.close;
    return ;
  });
  res.send();
});

app.use('/', express.static('html'));

app.listen(PORT, HOST);

console.log('up and running');
