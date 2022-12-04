const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
// app.set('views', 'views');

const adminRou = require('./routes/admin');
const shopRou = require('./routes/shop');
const productsController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')))

app.use((req, res, next) => {
    // User.findByPk(1)
    //     .then(user => {
    //         req.user = user;
    //         next();
    //     }).catch(err => console.log(err));
    next();
})

app.use('/admin', adminRou);
app.use(shopRou);

app.use(productsController.get404);

// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
// User.hasMany(Product); // optional argument same as upone

mongoConnect(() => {
    app.listen(2000, () => {
        console.log('listening to the port');
    })
})