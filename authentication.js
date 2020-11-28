'use strict'


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

module.exports = {
    clientAuthentication: isAuthenticated,
    staffAuthentication: staffAuthentication,
    managerAuthentication: managerAuthentication
}