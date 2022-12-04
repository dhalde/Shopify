const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-prod',
        editing: false
    });
}

exports.postAddProduct = (req, res) => {
    // console.log(req.body);
    // prod.push({ title: req.body.title });
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product(title, price, description, imageURL);
    product.save()
        .then((res) => {
            console.log("Added to database");
            res.redirect('/admin/products');

        }).catch((err) => console.log(err));
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
            // console.log(`product is:${product}`);
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            });
        })
        .catch((err) => console.log(err))

};

exports.getProducts = (req, res) => {
    Product.fetchAll()
        .then((product) => {
            // console.log(product);
            res.render('admin/products', {
                prods: product,
                pageTitle: 'Admin Products',
                path: '/admin/products',
            });
        }).catch((err) => console.log(err))

}