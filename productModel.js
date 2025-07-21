// server/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String, // Base64 or URL
});

module.exports = mongoose.model('Product', productSchema);