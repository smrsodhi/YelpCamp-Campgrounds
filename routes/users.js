const express = require('express')

const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const users = require('../controllers/users')
const { storeRedirectUrl } = require('../middleware')

const router = express.Router()

router.route('/register')
    .get(users.newUser)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.newLogin)
    .post(storeRedirectUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.createLogin)

router.get('/logout', users.logout)

module.exports = router