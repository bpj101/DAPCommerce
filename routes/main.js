'use strict';

const
    routes = require('express').Router();

// Routes

routes.get('/', function(req, res, next) {
    res.render('main', {
        message: req.flash('msg'),
        user: req.user
    });
});

routes.get('/about', function(req, res, next) {
    res.render('about', {
        message: req.flash('msg')
    });
});

module.exports = routes;
