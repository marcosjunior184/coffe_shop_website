'use strict'

var express = require('express');
var router = new express.Router();

router.get('/test', (req, res) => {
    res.render('OrderForm', {name: req.session.username})
})

module.exports = router;