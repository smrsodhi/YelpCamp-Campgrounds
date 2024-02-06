const express = require('express')

const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { storeRedirectUrl } = require('../middleware')
const users = require('../controllers/users')

router.route('/register')
    .get(users.newUser)
    .post(catchAsync(users.createUser))

router.route('/login')
    .get(users.newLogin)
    .post(storeRedirectUrl, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.createLogin)

router.get('/logout', users.logout)

module.exports = router