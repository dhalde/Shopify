const { Router } = require('express');
const express = require('express');
const path = require('path');
const { check } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is_auth');

const route = express.Router();

// /admin/add-prod
route.get('/add-prod', isAuth, adminController.getAddProduct);

route.get('/products', isAuth, adminController.getProducts);

route.post('/add-prod',
    [
        check('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),


        check('price').isFloat(),
        check('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth, adminController.postAddProduct);

route.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

route.post('/edit-product',
    [
        check('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),


        check('price').isFloat(),
        check('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isAuth, adminController.postEditProduct);

route.delete('/product/:productId', isAuth, adminController.deleteProduct);


module.exports = route;