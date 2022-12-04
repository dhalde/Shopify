const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, description, imageURL) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageURL = imageURL;
    }

    save() {
        const db = getDb();
        return db.collection('products').insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            })
    }
    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => { console.log(err) });
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) }).next()
            .then(prod => {
                console.log(prod);
                return prod;
            })
            .catch(err => { console.log(err) });
    }
}

module.exports = Product;