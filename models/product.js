'use strict';

const
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;



/* The product schema attributes / characteristics / fields */
const ProductSchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    name: String,
    price: Number,
    image: String
});

module.exports = mongoose.model('Product', ProductSchema);
