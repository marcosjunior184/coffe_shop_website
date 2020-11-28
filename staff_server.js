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

router.get('/staffPage', auth.staffAuthentication,(req, res) => {res.render('staff/staffPage', {name: req.session.username, permission: req.session.user_permission})});

router.get('/StaffManagent', auth.managerAuthentication, (req, res) => { res.render('staff/StaffManagement')});

router.get('/staffEdit/:StaffNumber', auth.managerAuthentication, (req, res) => {res.render('staff/StaffEdit', {emp_number: req.params['StaffNumber']})});

router.get('/EditItem/:Item', auth.managerAuthentication, (req, res) => { res.render('staff/EditItem', {item: req.params['Item']})});

router.get('/EditMenu', auth.managerAuthentication, (req, res) => {res.render('staff/EditMenu')});

router.get('/AddToMenu', auth.managerAuthentication, (req, res) => {res.render('staff/AddToMenu')});

router.get('/OrderReview', auth.staffAuthentication, (req, res) => {res.render('staff/OrderReview')});


//------------------XHR-------------------------------------//

router.post('/EditStaff', EditStaff);

router.post('/getStaff', getStaff);

router.post('/RemoveStaff', RemoveStaff);

router.post('/RemoveFromMenu', deleteFromMenu);

router.post('/addToMenu', addToMenu);

router.post('/itemEdit', auth.managerAuthentication, itemEdit);

router.get('/getOrderReview', getUsersOrder);

router.post('/addMessage', addMessage);


//-----------------FUNCTIONS---------------------------------//

 function EditStaff(req, res){
    var column = req.body.field;
    var value = req.body.value;
    var item = req.body.Emp_Number;

    var sql = 'UPDATE staff SET '+column+'='+ JSON.stringify(value)+' Where Employee_Number='+item +' ;';

    con.query(sql, function(err, result, field){
        if (err){
            throw err;
        }
        res.send();
    })
}

function getStaff(req, res){
    var sql = 'SELECT * FROM staff ;';

    con.query(sql, function (err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
  }

  function RemoveStaff(req, res){
    var staffToRemove = req.body.Emp_Number;

    var sql = 'DELETE FROM staff WHERE Employee_Number='+staffToRemove;

    con.query(sql, function(err, result, fields){
        if (err){
            throw err;
        }
        res.send();
    })
}

function deleteFromMenu(req, res){
    var item = req.body.Item;

    var sql = ('DELETE FROM menu WHERE Item='+JSON.stringify(item)+';')
    con.query(sql, function(err, ressult, fields){
        if (err){
            throw err;
        }
    })
    
}

function addToMenu(req, res){
    var item = req.body.Item;
    var price = req.body.Price;
    var type = req.body.Type;
    var description = req.body.Description;

    var sql = 'INSERT INTO menu (Item, Type, Description, Price) VALUES ('+JSON.stringify(item)+','+JSON.stringify(type)+','+JSON.stringify(description)+','+price+');'


    con.query(sql, function(err, ressult, fields){
        if (err){
            throw err;
        }
        res.send();
    })
    
}

function itemEdit(req, res){
    var column = req.body.field;
    var value = req.body.value;
    var item = req.body.Item;
    if (column == 'Promotion' || column == 'Price'){
        var sql = 'UPDATE menu SET '+column+'='+ value+' Where Item='+JSON.stringify(item) +' ;';
    }
    else{
    var sql = 'UPDATE menu SET '+column+'='+ JSON.stringify(value)+' Where Item='+JSON.stringify(item) +' ;';
    }
    con.query(sql, function (err, ressult, fields){
        if (err) {
            throw err;
        }
        res.send();
    })
  }

  function getUsersOrder(req, res){
    var sql = "SELECT * FROM Orders;";
    con.query(sql, function(err, ressult, fields){
        if (err){
            throw err;
        }
        res.send(ressult);
    })
}

function addMessage(req, res){
    var user_id = req.body.client_id;
    var message = req.body.message;
    var date = new Date();
    var StringDate = date.toUTCString();
    console.log(date);

    var sql = 'INSERT INTO messages (Client_id, Message, time_stamp) VALUES ('+user_id+','+JSON.stringify(message)+','+JSON.stringify(StringDate)+');';
    con.query(sql, function(err, result, fields){
        if (err) throw err;
        res.send();
    })
}

module.exports = router;