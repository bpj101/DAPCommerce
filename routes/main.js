'use strict';

const
    routes = require('express').Router(),
    User = require('../models/user'),
    Product = require('../models/product');

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

routes.get('/products/:id', (req, res, next) => {
    Product
        .find({
            category: req.params.id
        })
        .populate('category')
        .exec((err, products) => {
            if (err) return next(err);
            res.render('category', {
                products: products
            });
        });
});

routes.get('/product/:id', (req, res, next) => {
    Product
        .findById({
            _id: req.params.id
        })
        .populate('category')
        .exec((err, product) => {
            if (err) return next(err);
            res.render('product', {
                product: product
            });
        });
});

module.exports = routes;
