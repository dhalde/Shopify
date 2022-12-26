const User = require('../models/user');
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
// const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "3d0a644bef82d7",
        pass: "099414fa06a150"
    }
});

// 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
// const api_key = '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'
// sgMail.setApiKey(api_key);

exports.getLogin = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/login', {

        path: '/login',
        pageTitle: 'Login',
        // isAuthenticated: false
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        // isAuthenticated: false
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',

        },
        validationErrors: []
    })
}
exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,

            },
            validationErrors: errors.array()
        })
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: password,

                    },
                    validationErrors: []
                })
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });

                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password,

                        },
                        validationErrors: []
                    })

                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })

        })
        .catch((err) => {
            res.redirect('/500');
        });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,

            },
            validationErrors: errors.array()
        })
    }
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'E-Mail exists already.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const user = new User({
                        email: email,
                        password: hashPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'didh1802@gmail.com',
                        subject: 'Signup succeeded',
                        html: '<h1>Successfully signed up!</h1>'
                    });

                }).catch((err) => {
                    res.redirect('/500');
                });

        })

        .catch((err) => {
            res.redirect('/500');
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}

exports.postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'didh1802@gmail.com',
                    subject: 'Password Reset',
                    html: `<p>You requested password reset</p>
                <p>Click this <a href='http://localhost:2000/reset/${token}'>Link</a> to set a new password</p>`
                });
            })
            .catch((err) => {
                res.redirect('/500');
            });
    });
};

exports.getNewPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            }
            else {
                message = null;
            }

            res.render('auth/new-password', {
                path: '/new password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch((err) => {
            res.redirect('/500');
        });


}

exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch((err) => {
            res.redirect('/500');
        });

}