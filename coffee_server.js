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

app.get('/MenuAdd', (req, res) => {res.sendFile(__dirname + "/views/staffSide/MenuAdd.html")});

app.get('/MenuRemove', (req, res) => {res.sendFile(__dirname + "/views/staffSide/MenuRemove.html")});

app.get('/OrderReview', (req, res) => {res.sendFile(__dirname+ "/views/staffSide/OrderReview.html")});

app.get('/clientLogin', (req, res) => {res.sendFile(__dirname + "/views/clientLogin.html")});

app.get('/clientLogon', (req, res) => {res.sendFile(__dirname + "/views/clientLogOn.html")});

app.get('/clientPage', (req, res) => {res.sendFile(__dirname + "/views/clientPage.html")});

app.get('/menu', (req, res) => {res.sendFile(__dirname + "/views/menu.html")});

app.get('/orderForm', (req, res) => {res.sendFile(__dirname + "/views/orderForm.html")});

app.get('/menuEdit', (req, res) => {res.sendFile(__dirname + "/views/menuEdit.html")});

app.get('/menuEdit', (req, res) => {res.sendFile(__dirname + "/views/menuEdit.html")});

app.get('/myOrder', (req, res) => {res.sendFile(__dirname + "/views/myOrder.html")});

app.get('/visitorMenu' ,(req, res) => {res.sendFile(__dirname + '/views/visitorMenu.html')});

//--------------------XHL------------------------------------------//

app.post('/addClient', addClient);

app.get('/getMenu', getMenu);

app.get('/getOrderReview', getOrders);

app.post('/addToOrder', addToOrder);

app.post('/completeOrder', completeOrder);

app.post('/addToMenu', addToMenu);

app.post('/menuRemove', menuRemove);

app.post('/getOrderByEmail', getOrderByEmail);

app.post('/cancelOrder', cancelOrder);

app.post('/checkUser', checkUser);

app.post('/checkStaff', cehckStaff);

app.post('/addMessage', addMessage);

app.post('/getMessage', getMessage);


//----------------Functions----------------------------------------//

async function addClient(req, res){
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var BirthDay = req.body.BirthDay;
    var Email = req.body.Email;
    var Password = req.body.Password;

    var sql = 'INSERT INTO customers (First_name, Last_name, Birth_Day, Email, Password) VALUES ('+JSON.stringify(FirstName)+','+JSON.stringify(LastName)+','+JSON.stringify(BirthDay)+','+JSON.stringify(Email)+','+JSON.stringify(Password)+')';

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send();
    })

}

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
    var userEmail = req.body.Email;
    if(typeof userEmail === 'undefined'){
        res.status(404).end;
    }
    else{
        
        var sql = 'INSERT INTO Orders (Item, Quantity, Order_total, OrderNumber , Client_id) VALUES ('+JSON.stringify(item)+','+ 1 +','+price+','+orderNumber+','+JSON.stringify(userEmail)+');';
        con.query(sql, function(err, result, fields){
            if (err){
                throw err;
            }
            res.send();
        })
    }
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

async function addToMenu(req, res){
    const Item = req.body.Item;
    const Type = req.body.Type;
    const Description = req.body.Description;
    const Promotion = req.body.Promotion;
    const Price = req.body.Price;

    var sql = 'INSERT INTO menu (Item, Type, Description, Price) VALUES ('+JSON.stringify(Item)+','+JSON.stringify(Type)+','+JSON.stringify(Description)+','+ Price+')';

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send();
    })
}

async function menuRemove(req, res){
    const item = req.body.Item;

    var sql = 'DELETE FROM menu WHERE Item='+JSON.stringify(item);
    con.query(sql, function(err, result, fields){
        if(result["affectedRows"] == 0){
            res.status(404).end();
        }
        res.send();
    })
}

async function getOrderByEmail(req, res){
    var email = req.body.Email;


    var sql = 'SELECT * FROM Orders WHERE Client_id='+JSON.stringify(email);
     con.query(sql, function(err, result, fields){
        if (err) {
            throw err;
        }
        res.send(result);
     })
}

async function cancelOrder(req, res){
    var Item = req.body.Item;
    var OrderNumber = req.body.OrderNumber;
    var Email = req.body.Email;

    var sql = 'DELETE FROM Orders WHERE Item='+JSON.stringify(Item)+' AND OrderNumber='+OrderNumber+' AND Client_id='+JSON.stringify(Email);

    con.query(sql, function(err, result, fileds){
        if (err){
            throw err;
        }
        res.send();
    })
}

async function checkUser(req, res){
    var email = req.body.Email;
    var password = req.body.Password;

    var sql = "SELECT count(1) FROM customers WHERE Email=" + JSON.stringify(email) + ' AND Password='+JSON.stringify(password);

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        else if (result[0]['count(1)']){ // The password and email match
            res.send();

        }else{
            res.status(404).end();
        }
    })
}

async function cehckStaff(req, res){
    var Employee_Number = req.body.EmployeeNumber;
    var Password = req.body.Password;

    var sql = "SELECT count(1) FROM staff WHERE Employee_Number=" + Employee_Number + ' AND Password='+JSON.stringify(Password);

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }else if (result[0]['count(1)']){ // The password and employee number match
            res.send();

        }else{
            res.status(404).end();
        }
    })
}

async function addMessage(req, res){
    var Email = req.body.Email;
    var Item = req.body.Item;
    var sql = 'INSERT INTO messages (User_Email, Message) Values ('+JSON.stringify(Email)+', "Your '+Item+' is reay to pick up")'


    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send();
    })
}

async function getMessage(req, res){
    var email = req.body.Email;

    var sql = 'SELECT Message FROM messages WHERE User_Email='+JSON.stringify(email);

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
}

app.listen(PORT, HOST);
console.log("up and running");