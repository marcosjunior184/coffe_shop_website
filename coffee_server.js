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
    database: 'simplecoffee',
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

app.use('/', express.static('CSS'));


app.get('/', (req, res) => {res.sendFile(__dirname + "/views/indesx.html")});

app.get('/stafflLogin', (req, res) => {res.sendFile(__dirname+ "/views/staffLogin.html")});

app.get('/staffPage', (req, res) => {res.sendFile(__dirname + "/views/staffSide/staffPage.html")});

app.get('/OrderReview', (req, res) => {res.sendFile(__dirname+ "/views/staffSide/OrderReview.html")});

app.get('/clientLogin', (req, res) => {res.sendFile(__dirname + "/views/clientLogin.html")});

app.get('/clientLogon', (req, res) => {res.sendFile(__dirname + "/views/clientLogOn.html")});

app.get('/clientPage', (req, res) => {res.sendFile(__dirname + "/views/clientPage.html")});

app.get('/menu', (req, res) => {res.sendFile(__dirname + "/views/menu.html")});

app.get('/orderForm', (req, res) => {res.sendFile(__dirname + "/views/orderForm.html")});

app.get('/menuEdit', (req, res) => {res.sendFile(__dirname + "/views/menuEdit.html")});

app.get('/menuEdit', (req, res) => {res.sendFile(__dirname + "/views/menuEdit.html")});

app.get('/myOrder', (req, res) => {res.sendFile(__dirname + "/views/myOrder.html")});

//--------------------XHL------------------------------------------//

app.get('/getMenu', getMenu);

app.get('/getOrderReview', getOrders);

app.post('/addToOrder', addToOrder);

app.post('/completeOrder', completeOrder);

//----------------Functions----------------------------------------//

async function getMenu(req, res){
    var sql = 'SELECT * FROM menu;';

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
}

async function addToOrder(req, res){
    var item = req.body.Item;
    var price = req.body.Price;
    var orderNumber = req.body.OrderNumber;


    var sql = 'INSERT INTO Orders (Item, Quantity, Order_total, OrderNumber) VALUES ('+JSON.stringify(item)+','+ 1 +','+price+','+orderNumber+');';
    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        linkOrder(orderNumber)
        res.send();
    })
}

async function linkOrder(orderNumber){
    var sql = 'INSERT INTO customers (Order_Number) VALUES ('+orderNumber+');';
    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
    })
}

async function getOrders(req, res){
    var sql = 'SELECT * FROM orders';
    con.query(sql, function(err, result, fields){
        if (err){
            throw  err;
        }
        res.send(result);
    })
}

async function completeOrder(req, res){
    const Item = req.body.Item;
    const OrderNum = req.body.OrderNumber;

    const sql = 'DELETE FROM orders WHERE Item='+JSON.stringify(Item)+' AND OrderNumber='+OrderNum;

    con.query(sql, function(err, result, field){
        if (err){
            throw err;
        }
        res.send();
    })
}

app.listen(PORT, HOST);
console.log("up and running");