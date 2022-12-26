const express = require('express');
// const path = require('path');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is_auth');
const route = express.Router();

route.get('/', shopController.getIndex);

route.get('/products', shopController.getProduct);

route.get('/products/:productid', shopController.getProductById);

route.get('/cart', isAuth, shopController.getCart);

route.post('/cart', isAuth, shopController.postCart);

route.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

route.get('/checkout', isAuth, shopController.getCheckout);

route.get('/checkout/success', shopController.getCheckoutSuccess);

route.get('/checkout/cancel', shopController.getCheckout);


// route.post('/create-order', isAuth, shopController.postOrder);

route.get('/orders', isAuth, shopController.getOrders);

route.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = route;