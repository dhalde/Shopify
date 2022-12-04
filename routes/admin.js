const { Router } = require('express');
const express = require('express');
const path = require('path');

const adminController = require('../controllers/admin');
const route = express.Router();


// /admin/add-prod
route.get('/add-prod', adminController.getAddProduct);

route.get('/products', adminController.getProducts);

route.post('/add-prod', adminController.postAddProduct);

route.get('/edit-product/:productid', adminController.getEditProduct);

// router.post('/edit-product', adminController.postEditProduct);

// router.post('/delete-product', adminController.postDeleteProduct);


module.exports = route;