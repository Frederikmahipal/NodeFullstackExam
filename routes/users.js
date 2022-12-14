const express = require('express');
const { create } = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
const User = require('../models/User');
const { checkAuthenticated } = require('../config/auth');

router.get('/register', (req, res) => {
    res.render('register')
});

router.get('/login', (req, res) => {
    res.render('login')
});

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err);
        }
    })
    req.flash('success_message', 'Signed out');
    res.redirect('/users/login')
});



router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    let errors = [];

    if (!name || !email || !password) {
        errors.push({ message: 'no empty fields allowed' });
    }

    if (password.length < 8) {
        errors.push({ message: 'Minimum req. for password is 8 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password
        });
    } else {
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    errors.push({ message: 'email already in use' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password
                    });
                } else {
                    const createUser = new User({
                        name,
                        email,
                        password
                    });
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(createUser.password, salt, (err, hash) => {
                            if (err) throw err;

                            createUser.password = hash;
                            createUser.save()
                                .then(user => {
                                    req.flash('success_message', 'Successfully signed up');
                                    res.redirect('login');
                                })
                        }))
                    console.log(createUser)
                }
            })
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/homepage',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next); 
});


module.exports = router;