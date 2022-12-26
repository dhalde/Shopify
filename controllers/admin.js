
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file')
exports.getAddProduct = (req, res) => {

    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-prod',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []

    });
}

exports.postAddProduct = (req, res) => {
    // console.log(req.body);
    // prod.push({ title: req.body.title });
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;



    if (!image) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-prod',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,

            },
            errorMessage: 'Attach file is not an image',
            validationErrors: []

        });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-prod',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,

            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()

        });

    }
    const imageURL = image.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageURL: imageURL,
        userId: req.user
    });
    product.save()
        .then((result) => {
            console.log("Added to database");
            res.redirect('/admin/products');

        }).catch((err) => {
            res.redirect('/500');
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    // console.log(prodId);
    Product.findById(prodId)
        .then((product) => {
            // throw new Error('Dummy');
            // console.log(`product is:${product}`);
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []

            });
        })
        .catch((err) => {
            res.redirect('/500');
        });

};



exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;
    // console.log(image);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-prod',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        });

    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.description = updatedDescription;
            product.price = updatedPrice;

            if (image) {
                fileHelper.deleteFile(product.imageURL);
                product.imageURL = image.path;

            }

            return product.save().then((result) => {
                console.log("Updated");
                res.redirect('/admin/products');

            });
        })
        .catch((err) => {
            res.redirect('/500');
        });
};

exports.getProducts = (req, res) => {
    Product.find({ userId: req.user._id })
        .then((product) => {
            // console.log(product);
            res.render('admin/products', {
                prods: product,
                pageTitle: 'Admin Products',
                path: '/admin/products'

            });
        }).catch((err) => {
            res.redirect('/500');
        });

}

exports.deleteProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                throw new Error('Product not found.');
            }
            fileHelper.deleteFile(product.imageURL);
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then(() => {
            console.log("Destroyed!");
            res.status(200).json({ message: 'Success' });
        }).catch((err) => {
            res.status(500).json({ message: 'Deleting product failed.' });

        });
}


