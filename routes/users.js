const express = require('express')

const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeRedirectUrl } = require('../middleware')

const User = require('../models/user')

// NEW USER
router.get('/register', function (req, res) {
    res.render('users/register')
})

// CREATE USER
router.post('/register', catchAsync(async function (req, res) {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const newUser = await User.register(user, password)
        req.login(newUser, function (err) {
            if (err) {
                return next(err)
            }
            req.flash('success', 'Welcome to Yelpcamp!')
            res.redirect('/campgrounds')
        })
    } catch (err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}))

// NEW LOGIN
router.get('/login', function (req, res) {
    res.render('users/login')
})

// CREATE LOGIN
router.post('/login', storeRedirectUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), function (req, res) {
    const redirectUrl = res.locals.redirectUrl || '/campgrounds'
    delete req.session.redirectUrl
    req.flash('success', 'Welcome back!')
    res.redirect(redirectUrl)
})

// LOGOUT
router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged out!')
        res.redirect('/campgrounds')
    })
})

module.exports = router