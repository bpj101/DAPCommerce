'use strict';


console.log('this' + process.env.NODE_ENV);

if (process.env.NODE_ENV === 'production') {
    // Offer productions stage environment variables
    module.exports = {
        host: process.env.host || '',
        dbURI: process.env.dbURI,
        secretKey: process.env.secretKey
    };
} else {

    // Offer dev stage settings and data
    module.exports = require('./development.json');

}


