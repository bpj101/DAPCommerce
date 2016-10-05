'use strict';

const
    routes = require('express').Router(),
    User = require('../models/user'),
    Product = require('../models/product');

Product.createMapping((err, mapping) => {
    if (err) {
        console.log('error creating mapping');
        console.log(err);
    } else {
        console.log('Mapping Created');
        console.log(mapping);
    }
});

let stream = Product.synchronize();
let count = 0;

stream.on('data', () => {
    count++;
});

stream.on('close', () => {
    console.log('Indexed ' + count + ' documents');
});

stream.on('error', (err) => {
    console.log(err);
});

// Routes

routes.post('/search', (req, res, next) => {
    // additional coding
    res.redirect('/search?q=' + req.body.q);
});

routes.get('/search', (req, res, next) => {
    if (req.query.q) {
        Product.search({
            query_string: {
                query: req.query.q
            },
        }, (err, results) => {
            if (err) return next(err);
            let data = results.hits.hits.map((hit) => {
                return hit;
            });
            console.log(data);
            res.render('search-result', {
                query: req.query.q,
                data: data
            });
        });
    }
});


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
