'use strict';
const
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  config = require('./index'),
  async = require('async'),
  Cart = require('../models/cart'),
  User = require('../models/user');



// Serialize and Deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Middleware
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {

    User.findOne({
      email: email
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('msg', 'No user has been found'));
      }
      if (!user.checkPassword(password)) {
        return done(null, false, req.flash('msg', 'Incorrect password.'));
      }
      return done(null, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: config.fb.clientID,
    clientSecret: config.fb.clientSecret,
    callbackURL: config.fb.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({
      facebook: profile.id
    }, (err, user) => {
      if (err) cb(err);

      if (user) {
        return cb(null, user);
      } else {
        async.waterfall([
          (cb) => {
            let newUser = new User();
            newUser.email = profile._json.email;
            newUser.facebook = profile.id;
            newUser.tokens.push({
              kind: 'facebook',
              token: accessToken
            });
            newUser.profile.name = profile.displayName;
            newUser.profile.picture = 'http://graph.facebook.com/' + profile.id + '/picture?type=large';
            newUser.save((err) => {
              if (err) throw err;
              cb(err, newUser);
            });
          }, (newUser) => {
            let cart = new Cart();
            cart.owner = newUser._id;
            cart.save((err) => {
              if (err) return cb(err);
              return cb(err, newUser);
            });
          }
        ]);
      }
    });
  }
));

// Custom function to validate

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');

};
