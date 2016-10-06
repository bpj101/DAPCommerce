'use strict';

const
  routes = require('express').Router(),
  User = require('../models/user'),
  Product = require('../models/product');

function paginate(req, res, next) {
  let perPage = 8;
  let page = req.params.page;

  Product
    .find({})
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec((err, products) => {
      if (err) return next(err);
      Product.count().exec((err, count) => {
        if (err) return next(err);
        res.render('product-main', {
          message: req.flash('msg'),
          products: products,
          pages: count / perPage
        });
      });
    });
}

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
      }
    }, {
      hydrate: true
    }, (err, results) => {
      if (err) return next(err);
      let xdata = [];
      let data = results.hits.hits.map((hit) => {
        xdata.push(hit);
        return hit;
      });
      console.log(xdata);
      res.render('search-result', {
        query: req.query.q,
        data: xdata
      });

    });
  }
});


routes.get('/', function(req, res, next) {

  if (req.user) {
    paginate(req, res, next);

  } else {
    res.render('main', {
      message: req.flash('msg'),
      user: req.user
    });
  }
});

routes.get('/page/:page', (req, res, next) => {

  paginate(req, res, next);

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
