'use strict';
const
    routes = require('express').Router(),
    Category = require('../models/category');

routes.get('/add-category', (req, res, next) => {
    res.render('admin/add-category', {
        message: req.flash('success')
    });
});

routes.post('/add-category', (req, res, next) => {
    let category = new Category();
    category.name = req.body.name;

    category.save((err) => {
        if (err) return next(err);
        req.flash('success', 'Category Created');
        return res.redirect('/add-category');
    });
});


module.exports = routes;
