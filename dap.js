'use strict';
const express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    config = require('./config'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    engine = require('ejs-mate'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('express-flash');

const dap = express(),
    port = config.port;

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
    secret: config.secretKey
}));
dap.use(flash());


dap.engine('ejs', engine);
dap.set('view engine', 'ejs');

// All Routes
dap.use(require('./routes/main'));
dap.use(require('./routes/user'));

// Server
dap.listen(port, function(err) {
    if (err) throw err;
    console.log('Server is running on port:' + port);
});
