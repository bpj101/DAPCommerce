'use strict';
const mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto'),
  Schema = mongoose.Schema;


/* The user schema attributes / characteristics / fields */
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,

  facebook: String,
  tokens: Array,

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
    paid: {
      type: Number,
      default: 0
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  }]
});

/* Hash password before saving to database */

UserSchema.pre('save', function(next) {
  var user = this;
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
UserSchema.methods.checkPassword = function(password) {
  var result = bcrypt.compareSync(password, this.password);
  return result;
};

UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  let md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro';
};


module.exports = mongoose.model('User', UserSchema);
