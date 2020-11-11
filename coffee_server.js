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
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/**
 * Set local strategy for a log in 
 */
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password', 
    passReqToCallback: true
}, function(req, username, password, done){


    if(!username || !password){return done(null, false, req.flash('message', 'All fields need to be filled'));}

    var sql='SELECT * FROM customers where Email='+JSON.stringify(username);
    con.query(sql, function(err, rows){
        console.log(rows[0].user_id);
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
            return done (null, rows[0]);
        });
    })
}))

/**
 * Passport serialization
 */
passport.serializeUser(function(user, done){
    done(null, user.user_id);
})

/**
 * Passport deserialization
 */
passport.deserializeUser(function(id, done){
    console.log("PRE SQL " + id+1);
    var sql = "SELECT * FROM customers WHERE user_id="+ id;
    con.query(sql, function (err, rows){
        console.log(rows[0] + '---- des IN QUERy');
        done(err, rows[0]);
    });
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

/**
 * GET for Root
 */
app.get('/', (req, res) => {
    
    res.render('index', {name: req.session.username});
});

/**
 * GET for log in
 */
app.get('/login', (req, res) => { res.render('login', {'message': req.flash('message')});})

/**
 * POST method to log in user.
 */
app.post('/login', passport.authenticate('local', {
    successRedirect: '/menu',
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res){
    res.render('login', {'message': req.flash('message')});
});

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
app.get('/logOn', logOn);
app.post('/insertUser', inserNewUser);
app.get('/myOrder', isAuthenticated,(req, res) => {res.render('myOrder')});



// FUNCTIONS FOR THE ROUTERS


/**
 * Render menu
 * @param {*} req - Require 
 * @param {*} res - Response
 */
async function menu(req, res){
    res.render('menu')
}

/**
 * A function to get menu table from database
 * @param {*} req 
 * @param {*} res 
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

/**
 * Render logOn
 * @param {*} req - Request
 * @param {*} res - Response
 */
async function logOn (req, res){
    await res.render('logOn')
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
    var sql = 'INSERT INTO customers (First_Name, Last_Name, Email, Birth_Day, Password) VALUES ('+ JSON.stringify(firstName)+','+JSON.stringify(lastName)+','+JSON.stringify(Email)+','+JSON.stringify(BirthDay)+','+JSON.stringify(hashedPassword)+');';
    con.query(sql, function(err, result, fields){
        if(err){
            throw err;
        }
        res.redirect('login')
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


app.use('/', express.static('views'));

app.listen(PORT, HOST);
console.log('up and running');
