'use strict';
const mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

/* The user schema attributes / characteristics / fields */
const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    profile: {
        name: {
            type: String,
            default: ''
        },
        picture: {
            type: String,
            default: ''
        }
    },
    address: String,
    history: [{
        date: Date,
        paid: {
            type: Number,
            default: 0
        },
        item: {
            type: Schema.Types.ObjectId,
            ref: 'products'
        }
    }]
});

/* Hash password before saving to database */

UserSchema.pre('save', function(next) {
    let user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });

});

/* Compare saved passwords with password submitted for verification */
UserSchema.method.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);
