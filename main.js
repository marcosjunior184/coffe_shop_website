'use strict';

// load package
const express = require('express');
const bodyParser = require("body-Parser");
const fs = require('fs');

const PORT = '80';
const HOST = '0.0.0.0';
const app = express();
 
const PATH = __dirname + "/html/";

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/html/root.html");
});

app.post('/save/', (req,res) => {
  var topic = req.body.topic_input;
  var name = req.body.name_input;
  var comment = req.body.comment;

  fs.writeFile('html/' + "feedback.txt", topic + "\n" + name  + "\n"+ comment + "\n" ,{ flag: 'a+' }, err => {
    if (err){
      console.error(err)
      return
    } 
    res.send("Comment sent successfuly");
  });

});

app.use('/', express.static('html'));

app.listen(PORT, HOST);

console.log('up and running');
