'use strict';

const
    routes = require('express').Router();

// Routes

routes.get('/', function(req, res, next) {
    res.render('../views/main', {
        message: req.flash('msg')
    });
});

routes.get('/about', function(req, res, next) {
    res.render('../views/about', {
        message: req.flash('msg')
    });
});

module.exports = routes;
