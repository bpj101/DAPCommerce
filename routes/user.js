'use strict';

const
    User = require('../models/user'),
    routes = require('express').Router();

routes.get('/signup', (req, res, next) => {
 res.render('../views/accounts/signup', {
     message: req.flash('msg')
 });

});


routes.post('/signup', (req, res, next) => {
    let user = new User();
    user.profile.name = req.body.name;
    user.password = req.body.passward;
    user.email = req.body.email;

    User.findOne({
        email: req.body.email
    }, (err, existingUser) => {
        if (existingUser) {
            req.flash('msg', 'Account with this email already exists');
            return res.redirect('/signup');
        } else {
            user.save((err) => {
                if (err) return next(err);
                req.flash('msg', 'New Account saved');
                return res.redirect('/');
            });
        }
    });
});

module.exports = routes;
