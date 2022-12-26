const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');

const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

app.set('view engine', 'ejs');
// app.set('views', 'views');

const adminRou = require('./routes/admin');
const shopRou = require('./routes/shop');
const authRou = require('./routes/auth');

const productsController = require('./controllers/error');
const User = require('./models/user');
// const mongoConnect = require('./util/database').mongoConnect;
const MongoDB_URI = 'mongodb+srv://dipesh:FSudX82QolTkwuOV@cluster0.v83juyv.mongodb.net/shop';
const store = new MongoDBStore({
    uri: MongoDB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.filename + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false)
    }
}

mongoose.set('strictQuery', true);

app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRou);
app.use(shopRou);
app.use(authRou);

app.get('/500', productsController.get500)

app.use(productsController.get404);

// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
// User.hasMany(Product); // optional argument same as upone

mongoose.connect(MongoDB_URI)
    .then(result => {

        app.listen(2000, () => {
            console.log('listening to port 2000')
        });

    }).catch(err => console.log(err));


