'use strict'


const express = require('express');
const bodyParser = require('body-Parser');
const axios = require('axios');
const mysql =  require('mysql');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { use, authenticate } = require('passport');
const Store = require('express-session').Store;
const db = require('./db_access');


//const redis = require('redis');
//const { url } = require('inspector');
//const redisStore = require('connect-redis')(session);

//    store: new redisStore({host: 'localhost', port: 8080, client: client, ttl: 260}),
//const client = redis.createClient();

const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();


/**
 * app.use list:
 *  - views
 *  - image
 *  - CSS
 *  - expressLayouts
 *  - bodyParser
 *  - session
 *  - flash
 *  - passport
 */
app.use('/views', express(__dirname + '/views'));
app.use(express.static('images'));
app.use('/image', express.static(__dirname + '/images'));
app.use(express.static('CSS'));
app.use('/CSS', express.static(__dirname + '/CSS'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'VERYSECRET',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/**
 * Set local strategy for a User log in 
 */
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    if(!username || !password){return done(null, false, req.flash('message', 'All fields need to be filled'));}

    var sql='SELECT * FROM customers where Email='+JSON.stringify(username);
    con.query(sql, function(err, rows){
        if(err){
            return done(req.flash('message', err));
        }
        if(!rows.length){
            return done(null, false, req.flash('message', 'invalied password or email'));
        }

        bcrypt.compare(password, rows[0].Password, function(err, result){
            if(!result){
                return done (null, false, req.flash('message', 'Invalid email or password'));
            }
            req.session.loggedin = true;
            req.session.username = rows[0].First_Name;
            req.session.user_id = rows[0].user_id;
            req.session.user_permission = rows[0].authorization;
            return done (null, rows[0]);
        });
    })
}))

/**
 * Set local strategy for a Staff log in 
 */
passport.use('Staff_logIn', new LocalStrategy({
    usernameField: 'employee_number',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done){
    if(!username || !password){return done(null, false, req.flash('message', 'All fields need to be filled'));}

    var sql='SELECT * FROM staff where Employee_Number='+JSON.stringify(username);
    con.query(sql, function(err, rows){
        if(err){
            return done(req.flash('message', err));
        }
        if(!rows.length){
            return done(null, false, req.flash('message', 'invalied password or email'));
        }

        bcrypt.compare(password, rows[0].Password, function(err, result){
            console.log("IN STAFF_LOGIN" + result)
            if(!result){
                return done (null, false, req.flash('message', 'Invalid email or password'));
            }
            req.session.loggedin = true;
            req.session.username = rows[0].First_Name;
            req.session.user_id = rows[0].Employee_Number;
            req.session.user_permission = rows[0].authorization;
            return done (null, rows[0]);
        });
    })
}))
/**
 * Passport serialization
 */
passport.serializeUser(function(user,done){
    done(null, user);
})

/**
 * Passport deserialization
 */
passport.deserializeUser(function(user, done){

    if(user.authorization == 'Client'){

        var sql = "SELECT * FROM customers WHERE user_id="+ user.user_id;
        con.query(sql, function (err, rows){
            done(err, rows[0]);
        });
    }else if(user.authorization == 'Staff' || user.authorization == 'Manager'){
        var sql = "SELECT * FROM staff WHERE Employee_Number="+ user.Employee_Number;
        con.query(sql, function (err, rows){
            done(err, rows[0]);
        });
    }
})

/**
 * Set a view engine
 */
app.set('views', path.join(__dirname+"/views"));
app.set('view engine', 'ejs');
app.set('layout', __dirname + '/views/layout');

/**
 * connect to mysql
 */
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'coffeeshop',
    password: 'Mad184'
});

/**
 * connect to database
 */
con.connect(function(err){
    if (err) {
        throw err;
    }
    console.log("Connect")
});

// ------------------- ROUTERS --------------------------//


/**
 * GET for Root
 */
app.get('/', (req, res) => {
    
    res.render('index', {name: req.session.username});
});

/**
 * Getter for item selected in the Order
 */
app.get('/Item/:itemName/:Price', (req, res) =>{
    res.render('Item', {item: req.params['itemName'], price: req.params['Price'], id: req.session.user_id});
})

/**
 * Post method to get a particular item
 */
app.post('/getItem', getItem);

/**
 * GET for log in
 */
app.get('/login', (req, res) => { res.render('login', {message: req.flash('message')});})

/**
 * POST method to log in user.
 */
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res){
    res.render('login', {'message': req.flash('message')});
});

/**
 * GET for the staf login page
 */
app.get('/staffLogin', (req, res) => {res.render('staff/staffLogin', {message: req.flash('message')})});

/**
 * POST method to authenticate a staff log in 
 */
app.post('/staffLogIn', passport.authenticate('Staff_logIn', {
    successRedirect: '/staffPage',
    failureRedirect: '/staffLogin',
    failureFlash: true
}),(req, res) => {res.render('staffLogin', {message: req.flash('message')})});

/**
 * GET for the staff page where the staff_user can check orders and remove them. If the user is Manager will have the ability to add staff to the system
 */
app.get('/staffPage', staffAuthentication,(req, res) => {res.render('staff/staffPage', {name: req.session.username, permission: req.session.user_permission})});

/**
 * POST method add a new staff
 */
app.post('/insertStaff', insertNewStaff);

/**
 * GET to staff log on page
 */
app.get('/StafflogOn', managerAuthentication,(req, res) => {res.render('staff/StaffLogOn')});

app.get('/OrderReview', staffAuthentication, (req, res) => {res.render('staff/OrderReview')});

app.get('/getOrderReview', getUsersOrder);

app.get('/AddToMenu', managerAuthentication, (req, res) => {res.render('staff/AddToMenu')});

app.post('/addToMenu', addToMenu);

app.get('/EditMenu', managerAuthentication, (req, res) => {res.render('staff/EditMenu')});

app.post('/itemEdit', managerAuthentication, itemEdit);

app.get('/EditItem/:Item', managerAuthentication, (req, res) => { res.render('staff/EditItem', {item: req.params['Item']})});

app.post('/RemoveFromMenu', deleteFromMenu);

app.get('/StaffManagent', managerAuthentication, (req, res) => { res.render('staff/StaffManagement')});

app.post('/getStaff', getStaff);

app.post('/RemoveStaff', RemoveStaff);

app.get('/staffEdit/:StaffNumber', managerAuthentication, (req, res) => {res.render('staff/StaffEdit', {emp_number: req.params['StaffNumber']})});

app.post('/EditStaff', EditStaff);


/**
 * GET for Menu
 */
app.get('/menu',menu);

/**
 * GET for the XML load the menu from database to be displayed on /menu
 */
app.get('/menuData', getMenuData);

/**
 * GET method for log on
 */
app.get('/logOn', (req, res) => {res.render('logOn')});


/**
 * POST method to add a new user
 */
app.post('/insertUser', inserNewUser);

/**
 * A GET method for my order
 */
app.get('/myOrder', isAuthenticated,(req, res) => {res.render('myOrder',{id: req.session.user_id})});

/**
 * A GET method for Order
 */
app.get('/Order', isAuthenticated ,(req, res) => {res.render('OrderForm', {name: req.session.username})});

/**
 * POST to set a order to the database
 */
app.post('/setOrder', setOrder);

/**
 * POST method to get the order of a user from the database
 */
app.post('/getMyOrder', getMyOrder);

/**
 * POST to delet an Item from a user's order
 */
app.post('/deleteItem', deleteItem);

// ------------------------   FUNCTIONS FOR THE ROUTERS -------------------------//

/**
 * Render menu
 * @param {*} req - Request 
 * @param {*} res - Response
 */
async function menu(req, res){
    res.render('menu')
}

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

/**
 * Get an Item from the database menu
 * @param {*} req - Request
 * @param {*} res - Response
 */
async function getItem(req, res){
    var Item = req.body.Item;
    
    var sql = "SELECT * FROM menu WHERE Item="+JSON.stringify(Item);
    con.query(sql, function(err, result, filds){
        if(err) throw err;
        res.send(result)
    })
    
}


/**
 * A function to add a new user to the database. It is userd on the /logOn 
 * @param {*} req - Request
 * @param {*} res - Response
 */
async function inserNewUser(req, res){
    try{
        var hashedPassword = await bcrypt.hash(req.body.Password, 10)
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var Email = req.body.Email;
        var BirthDay = req.body.birthDay
    }catch{
        res.send('ERROR')
    }
    var sql = 'INSERT INTO customers (First_Name, Last_Name, Email, Birth_Day, Password, authorization) VALUES ('+ JSON.stringify(firstName)+','+JSON.stringify(lastName)+','+JSON.stringify(Email)+','+JSON.stringify(BirthDay)+','+JSON.stringify(hashedPassword)+', Client);';
    con.query(sql, function(err, result, fields){
        if(err){
            throw err;
        }
        res.redirect('login')
    });    
}

/**
 * Insert a new staff to the database 'staff'
 * @param {*} req - Request
 * @param {*} res - Response
 */
async function insertNewStaff(req, res){
    try{
        var hashedPassword = await bcrypt.hash(req.body.Password, 10)
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var Email = req.body.Email;
        var BirthDay = req.body.birthDay
        var EmployeeNumber= req.body.Employee_Number;
        var permission = req.body.Permission;
    }catch{
        res.send('ERROR')
    }

    var sql = 'INSERT INTO staff (Employee_Number, First_Name, Last_Name, Email, Birth_Day, Password, authorization) VALUES ('+ JSON.stringify(EmployeeNumber) +','+ JSON.stringify(firstName)+','+JSON.stringify(lastName)+','+JSON.stringify(Email)+','+JSON.stringify(BirthDay)+','+JSON.stringify(hashedPassword)+','+ JSON.stringify(permission) + ');';
    con.query(sql, function(err, result, fields){
        if(err){
            throw err;
        }
        res.send();
    });    
    
}

/**
 * A function to check if the user is authenticated or not:
 *  - If yes, access is conceded
 *  - If not, direct to log in
 * @param {*} req - Request
 * @param {*} res - Response
 * @param {*} next - allowed next
 */
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

/**
 * Function to authenticate a staff user or a manager user
 * @param {*} req - Request
 * @param {*} res - Response 
 * @param {*} next - callback
 */
function staffAuthentication(req, res, next){
    if(req.session.user_permission == 'Staff' || req.session.user_permission == 'Manager' ){
        if (req.isAuthenticated()){
            return next();
        }
        res.redirect('/staffLogin');
    }
    else{
        res.redirect('/staffLogin');
    }
}

/**
 * Function to authenticate a staff user or a manager user
 * @param {*} req - Request
 * @param {*} res - Response 
 * @param {*} next - callback
 */
function managerAuthentication(req, res, next){
    if(req.session.user_permission == 'Manager' ){
        if (req.isAuthenticated()){
            return next();
        }
        res.redirect('/staffPage');
    }
    else{
        res.redirect('/staffLogin');
    }
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

  /**
   * If the database 'Orders' is empty, set the id AUTO_INCREMENT will be reset to 1
   * So by the end of the day the table should be empty and set back to 1, as we don't want 
   * the id keep increasing for ever
   * @param {*} req - Request
   * @param {*} res - Response
   */
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
   * Method to get the Order of a certain user from the database based on the client id
   * @param {*} req - Request
   * @param {*} res - Response
   */
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

  function getStaff(req, res){
    var sql = 'SELECT * FROM staff ;';

    con.query(sql, function (err, result, fields){
        if (err){
            throw err;
        }
        res.send(result);
    })
  }

  /**
   * Delete an item from a customer order removing it from the database
   * @param {*} req - Request
   * @param {*} res - Response
   */
  function deleteItem(req, res){
      var itemToDelete = req.body.item_id;


      var sql = "DELETE FROM Orders WHERE order_id="+itemToDelete;
      con.query(sql, function(err, result, fields){
          if (err){
              throw err;
          }
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

  function deleteFromMenu(req, res){
      var item = req.body.Item;

      var sql = ('DELETE FROM menu WHERE Item='+JSON.stringify(item)+';')
      con.query(sql, function(err, ressult, fields){
          if (err){
              throw err;
          }
      })
      
  }



app.use('/', express.static('views'));

app.use(require('./db_access'));

app.listen(PORT, HOST);
console.log('up and running');
