const express = require('express');
const path = require('path');

const shopController = require('../controllers/shop');

const route = express.Router();

route.get('/', shopController.getIndex);

route.get('/products', shopController.getProduct);

route.get('/products/:productid', shopController.getProductById);

// route.get('/cart', shopController.getCart);

// route.post('/cart', shopController.postCart);

// route.get('/orders', shopController.getOrder);

// route.get('/checkout', shopController.getCheckOut);

module.exports = route;