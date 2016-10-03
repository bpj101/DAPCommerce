'use strict';
const express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    config = require('./config'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    path = require('path'),
    pug = require('pug'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    cookieParser = require('cookie-parser'),
    flash = require('express-flash'),
    passport = require('passport');

const dap = express(),
    port = config.port;

// Acquiring Models
const
    User = require('./models/user'),
    Category = require('./models/category');


mongoose.connect(config.dbURI, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to Database');
    }
});

// Middleware
dap.use(express.static(__dirname + '/public'));
dap.use(morgan('dev'));
dap.use(favicon(__dirname + '/public/favicon.ico'));
dap.use(bodyParser.urlencoded({
    extended: true
}));
dap.use(bodyParser.json());
dap.use(cookieParser());
dap.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.secretKey,
    store: new MongoStore({
        url: config.dbURI,
        autoReconnect: true
    })
}));
dap.use(flash());
dap.use(passport.initialize());
dap.use(passport.session());
dap.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

dap.use((req, res, next) => {
    Category.find({}, (err, categories) => {
        if (err) next(err);
        res.locals.categories = categories;
        next();
    });
});


dap.set('views', path.join(__dirname, '/views'));
dap.set('view engine', 'pug');

// All Routes
dap.use(require('./routes/admin'));
dap.use(require('./routes/main'));
dap.use(require('./routes/user'));
// Server
dap.listen(port, function(err) {
    if (err) throw err;
    console.log('Server is running on port:' + port);
});
