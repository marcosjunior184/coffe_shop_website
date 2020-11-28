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
const auth = require('./authentication')


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


// ----------------------------------------------------------- ROUTERS ------------------------------------------------------------------//


app.get('/', (req, res) => { res.render('index', {name: req.session.username});}); // GET for Root

app.get('/login', (req, res) => { res.render('login', {message: req.flash('message')});}) // GET for log in

app.get('/staffLogin', (req, res) => {res.render('staff/staffLogin', {message: req.flash('message')})}); // GET for the staf login page

app.get('/StafflogOn', auth.managerAuthentication,(req, res) => {res.render('staff/StaffLogOn')}); // GET to staff log on page

app.get('/menu',(req, res) => { res.render('menu')}); // GET for Menu

app.get('/logOn', (req, res) => {res.render('logOn')}); // GET method for log on

//----------------------------------------------------------------XHR---------------------------------------------------------------------//

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
 * POST method to authenticate a staff log in 
 */
app.post('/staffLogIn', passport.authenticate('Staff_logIn', {
    successRedirect: '/staffPage',
    failureRedirect: '/staffLogin',
    failureFlash: true
}),(req, res) => {res.render('staffLogin', {message: req.flash('message')})});


/**
 * POST method add a new staff
 */
app.post('/insertStaff', insertNewStaff);

/**
 * POST method to add a new user
 */
app.post('/insertUser', inserNewUser);


/**
 * Post method to get a particular item
 */
app.post('/getItem', getItem);

// ------------------------------------------------------------------------------FUNCTIONS-----------------------------------------------------------//



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
    var sql ='INSERT INTO customers (First_Name, Last_Name, Email, Birth_Day, Password, authorization) VALUES ('+ JSON.stringify(firstName)+','+JSON.stringify(lastName)+','+JSON.stringify(Email)+','+JSON.stringify(BirthDay)+','+JSON.stringify(hashedPassword)+', "Client");';
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


app.use('/', express.static('views'));

app.use(require('./Client_server'));
app.use(require('./staff_server'));

app.listen(PORT, HOST);
console.log('up and running');
