const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth')

const route = express.Router();

route.get('/login', authController.getLogin);

route.get('/signup', authController.getSignup);

route.post('/login',
    [check('email').isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),

    check('password',
        'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),

    ], authController.postLogin);

route.post('/signup',
    [check('email').isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),

    check('password',
        'Please enter a password with only numbers and text atleast 5 charachters.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    check('confirmPassword').trim().custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error(`Passwords doesn't match!`);
        }
        return true;
    })

    ],
    authController.postSignup);

route.post('/logout', authController.postLogout);

route.get('/reset', authController.getReset);

route.post('/reset', authController.postReset);

route.get('/reset/:token', authController.getNewPassword);

route.post('/new-password', authController.postNewPassword);

module.exports = route;