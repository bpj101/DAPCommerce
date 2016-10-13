'use strict';
if (process.env.NODE_ENV === 'production') {
    // Offer productions stage environment variables
    module.exports = {
        host: process.env.host,
        dbURI: process.env.dbURI,
        secretKey: process.env.secretKey,
  fb: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    profileFields: ['emails', 'displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  }

    };
} else {

    // Offer dev stage settings and data
    module.exports = require('./development.json');

}
