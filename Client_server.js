'use strict'

var express = require('express');
var router = new express.Router();
var bcrypt = require('bcrypt');
const mysql =  require('mysql');
const auth = require('./authentication')

/**
 * connect to mysql
 */
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'coffeeshop',
    password: 'Mad184'
});



//----------------RENEDERING VIEWS--------------------------//

router.get('/myOrder', auth.clientAuthentication ,(req, res) => {res.render('myOrder',{id: req.session.user_id})});  // A GET method for my order

router.get('/Order', auth.clientAuthentication ,(req, res) => {res.render('OrderForm', {name: req.session.username})}); // A GET method for Order

router.get('/Item/:itemName/:Price', (req, res) =>{ res.render('Item', {item: req.params['itemName'], price: req.params['Price'], id: req.session.user_id});}) // A GET method for item selected in the Order

//------------------XHR-------------------------------------//

router.get('/menuData',getMenuData);

router.post('/setOrder', setOrder);

router.post('/getMyOrder', getMyOrder);

router.post('/getMyMessages', getMyMessages);

router.post('/deleteItem', deleteItem);

//-----------------FUNCTIONS---------------------------------//

/**
 * A function to get menu table from database
 * @param {*} req - Request
 * @param {*} res - Response
 */
async function getMenuData(req, res){
    var sql = "SELECT * FROM menu"
    con.query(sql, function(err, result, filds){
        if (err){
            throw err;
        }
        res.send(result);
    });
}

function getMyOrder(req, res){
    checkOrder(req, res);
    var user_id = req.body.user_id;
    var sql = "SELECT * FROM Orders WHERE Client_id="+user_id;
    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
  }

function getMyMessages(req, res){
    var user_id = req.body.user_id;
    var sql = "SELECT * FROM messages WHERE Client_id="+user_id;
    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
}


  function checkOrder(req, res){
    var sql = "SELECT EXISTS(SELECT 1 from Orders) AS OUTPUT;";
    con.query(sql, function(err, result, fields){
        if(err){
            throw err;
        }
        if(JSON.stringify(result[0].OUTPUT) == 0){
            con.query("ALTER TABLE Orders AUTO_INCREMENT=1;", function(err, result, fields){
                if (err){
                    throw err;
                }
            })
        }
    })
  }

  /**
 * Set a order of a user in the 'Orders' database
 * @param {*} req - Request 
 * @param {*} res - Response 
 */
function setOrder(req, res){
    var item = req.body.item;
    var id = req.body.id;
    var quantity = req.body.quantity;
    var price = req.body.price * quantity;

    var sql = "INSERT INTO Orders (Client_id, Item, Quantity, Order_total) VALUES ("+id +', '+JSON.stringify(item)+ ', '+quantity+', '+price + ');';
    con.query(sql, function(err, result, fields){
        if(err){
            throw err;
        }
        res.end();
    })
     
}

function deleteItem(req, res){
    var itemToDelete = req.body.item_id;
    var sql = "DELETE FROM Orders WHERE order_id="+itemToDelete;
    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
    })
}


module.exports = router;