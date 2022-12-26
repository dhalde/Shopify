const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { application } = require('express');
const stripe = require('stripe')('sk_test_51MJCWiSEANfDyP0ITao0H6uF9GTjmXb1BGr6RNFJLfAnkwnbxSzwDRXzfUPGJSNxoaZRvPbpUw91BCdPu0cEb0no00tO5Z4HFQ')

const ITEMS_PER_PAGE = 1;

exports.getProduct = (req, res) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((product) => {
            res.render('shop/product-list', {
                prods: product,
                pageTitle: ' All Products',
                path: '/product',
                csrfToken: req.csrfToken(),
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            res.redirect('/500');
        });

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
        }).catch((err) => {
            res.redirect('/500');
        });
};


exports.getIndex = (req, res) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((product) => {
            res.render('shop/index', {
                prods: product,
                pageTitle: 'Shop',
                path: '/',
                csrfToken: req.csrfToken(),
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            res.redirect('/500');
        });


};


exports.getCart = (req, res) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        }).catch((err) => {
            console.log(err);
            res.redirect('/500');
        });
}

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        });
};

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');

        }).catch((err) => {
            res.redirect('/500');
        });
}

exports.getCheckout = (req, res) => {
    let products;
    let total = 0;
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            products = user.cart.items;
            total = 0;
            products.forEach((p) => {
                total += p.quantity * p.productId.price;
            });

            return stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: products.map((p) => {
                    return {
                        quantity: p.quantity,
                        price_data: {
                            currency: "usd",
                            unit_amount: p.productId.price * 100,
                            product_data: {
                                name: p.productId.title,
                                description: p.productId.description,
                            },
                        },
                    };
                }),
                customer_email: req.user.email,
                success_url:
                    req.protocol + "://" + req.get("host") + "/checkout/success",
                cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
            });
        })
        .then((session) => {
            res.render("shop/checkout", {
                path: "/checkout",
                pageTitle: "Checkout",
                products: products,
                totalSum: total,
                sessionId: session.id,
            });
        })
        .catch((err) => {
            res.redirect('/500');
        });
}

exports.getCheckoutSuccess = (req, res) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch((err) => {
            res.redirect('/500');
        });
};

exports.postOrder = (req, res) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch((err) => {
            res.redirect('/500');
        });
};

exports.getOrders = (req, res) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders

            });
        }).catch((err) => {
            res.redirect('/500');
        });
}

exports.getInvoice = (req, res) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                throw new Error('No order found.');
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                throw new Error('Unauthorized.');
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });

            pdfDoc.text('-------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14)
                    .text(
                        prod.product.title +
                        ' - ' +
                        prod.quantity +
                        ' x ' +
                        '$' +
                        prod.product.price

                    );
            });

            pdfDoc.text('-----');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();



        }).catch((err) => {
            res.redirect('/500');
        });
}