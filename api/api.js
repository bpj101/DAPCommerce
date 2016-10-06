'use strict';
const
  routes = require('express').Router(),
  async = require('async'),
  faker = require('faker'),
  Category = require('../models/category'),
  Product = require('../models/product');

routes.post('/search', (req, res, next) => {
  Product.search({
    query_string: {
      query: req.body.search_term
    }
  }, (err, results) => {
    res.json(results);
  });
});

routes.get('/:name', function(req, res, next) {
  var product;
  async.waterfall([

    function(callback) {
      Category.findOne({
        name: req.params.name
      }, function(err, category) {
        if (err) return next(err);
        callback(null, category);
      });
    },
    function(category, callback) {
      for (var i = 0; i < 30; i++) {
        product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();
        console.log(product.name);
        product.save();
      }
    }
  ]);
  res.send({
    message: 'Success'
  });
});


module.exports = routes;
