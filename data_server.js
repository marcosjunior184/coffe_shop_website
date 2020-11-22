'use strict'

const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
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

});

app.post('/write', (req, res) => {

});


app.use('/', express.static('pages'));
app.listen(PORT, HOST);
console.log('up and runnig');
