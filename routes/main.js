'use strict';

const
  routes = require('express').Router(),
  User = require('../models/user'),
  Product = require('../models/product'),
  Cart = require('../models/cart'),
  stripe = require('stripe')('sk_test_FBfLuKZXURgAU4U6djoCuUVf'),
  async = require('async');

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


routes.get('/cart', (req, res, next) => {
  Cart
    .findOne({
      owner: req.user._id
    })
    .populate('items.item')
    .exec((err, foundCart) => {

      if (err) return next(err);
      res.render('accounts/cart', {
        message: req.flash('msg'),
        foundCart: foundCart
      });
    });
});


routes.post('/product/:product_id', (req, res, next) => {
  Cart.findOne({
    owner: req.user._id
  }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save((err) => {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});


routes.post('/remove', (req, res, next) => {
  Cart.findOne({
    owner: req.user._id
  }, (err, foundCart) => {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save((err, found) => {
      if (err) return next(err);
      req.flash('msg', 'Item removed');
      res.redirect('/cart');
    });
  });
});

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

routes.post('/payment', (req, res, next) => {
  let stripToken = req.body.stripeToken;
  let currentCharges = Math.round(req.body.stripeMoney * 100);

  stripe.customers.create({
    source: stripToken
  }).then((customer) => {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then((charge) => {
    async.waterfall([
      (callback) => {
        Cart.findOne({
          owner: req.user._id
        }, (err, cart) => {
          if (err) next(err);
          callback(err, cart);
        });
      }, (cart, callback) => {
        User.findOne({
          _id: req.user._id
        }, (err, user) => {
          if (err) next(err);
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }
            user.save((err, user) => {
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      }, (user) => {
        Cart.update({
          owner: user._id
        }, {
          $set: {
            items: [],
            total: 0
          }
        }, (err, updated) => {
          if (err) next(err);
          if (updated) {
            req.flash('msg', 'Payment transaction completed');
            res.redirect('/profile');
          }
        });
      }
    ]);
  });
});


module.exports = routes;
