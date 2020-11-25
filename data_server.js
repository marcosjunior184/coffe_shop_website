'use strict'

const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const { json } = require('body-parser');
const { response } = require('express');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

const PORT = 8888;
const HOST = '0.0.0.0';

let data = [{
    postID: '',
    username:'',
    text: '',
    timestamp: '',
}];

app.get('/', (req, res) => {
    res.send('Greetings');
});

app.get('/read', (req, res) => {
    res.json(data);
});


app.post('/write', (req, res) => {
    console.log('HII')
    let postID = req.body.id;
    let username = req.body.username;
    let text = req.body.text;
    let timestamp = req.body.timestamp;

    data.push({postID: postID, username: username, text: text, timestamp: timestamp});

    res.json(data);

});


app.use('/', express.static('pages'));
app.listen(PORT, HOST);
console.log('up and runnig');
