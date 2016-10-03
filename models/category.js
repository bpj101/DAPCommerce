'use strict';

const
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;



/* The category schema attributes / characteristics / fields */
const CategorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true
    }
});

module.exports = mongoose.model('Category', CategorySchema);


