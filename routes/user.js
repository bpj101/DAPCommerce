'use strict';

const
  User = require('../models/user'),
  Cart = require('../models/cart'),
  routes = require('express').Router(),
  async = require('async'),
  passport = require('passport'),
  passportConf = require('../config/passport');


routes.get('/login', (req, res, next) => {
  if (req.user) {
    return res.redirect('/profile');
  }
  res.render('accounts/login', {
    message: req.flash('loginMessage'),
  });
});

routes.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

routes.get('/profile', passportConf.isAuthenticated, function(req, res, next) {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) return next(err);
    res.render('accounts/profile', {
      message: req.flash('loginMessage'),
      user: user
    });
  });
});

routes.get('/signup', (req, res, next) => {
  res.render('accounts/signup', {
    errors: req.flash('msg'),
  });

});


routes.post('/signup', (req, res, next) => {

  async.waterfall([

    function(callback) {
      let user = new User();
      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
      User.findOne({
        email: req.body.email
      }, (err, existingUser) => {
        if (existingUser) {
          req.flash('msg', 'Account with this email already exists');
          return res.redirect('/signup');
        } else {
          user.save((err) => {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },
    function(user) {

      let cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if (err) return next(err);
        req.logIn(user, (err) => {
          if (err) return next(err);
          req.flash('loginMessage', 'New Account saved');
          res.redirect('/profile');
        });
      });
    }
  ]);
});

routes.get('/edit-profile', (req, res, next) => {
  res.render('accounts/edit-profile', {
    message: req.flash('success')
  });
});

routes.post('/edit-profile', (req, res, next) => {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save((err) => {
      if (err) return next(err);
      req.flash('success', 'Profile Updated');
      return res.redirect('/edit-profile');
    });
  });
});

routes.get('/logout', (req, res, next) => {
  req.logOut();
  res.redirect('/');
});

module.exports = routes;
