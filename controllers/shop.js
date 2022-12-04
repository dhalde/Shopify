const Product = require('../models/product');
// const Cart = require('../models/cart');

exports.getProduct = (req, res) => {
    Product.fetchAll()
        .then((product) => {
            res.render('shop/product-list', {
                prods: product,
                pageTitle: ' All Products',
                path: '/product',
            });
        })
        .catch((err) => console.log(err))

}


exports.getProductById = (req, res) => {
    const prodId = req.params.productid;
    Product.findById(prodId)
        .then((product) => {

            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            })
        }).catch((err) => console.log(err));
};


exports.getIndex = (req, res) => {
    Product.fetchAll()
        .then((product) => {
            res.render('shop/index', {
                prods: product,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch((err) => console.log(err))


};


exports.getCart = (req, res) => {
    res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
    });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findByPk(prodId, product => {
        Cart.addProduct(prodId, product.price);
    });
    res.redirect('/cart');
};

exports.getOrder = (req, res) => {
    res.render('shop/orders', {
        pageTitle: 'My Order',
        path: '/orders',
    });
}

exports.getCheckOut = (req, res) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};