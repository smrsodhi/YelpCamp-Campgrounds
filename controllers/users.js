const User = require('../models/user')

module.exports.newUser = function (req, res) {
    res.render('users/register')
}

module.exports.createUser = async function (req, res) {
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
}

module.exports.newLogin = function (req, res) {
    res.render('users/login')
}

module.exports.createLogin = function (req, res) {
    const redirectUrl = res.locals.redirectUrl || '/campgrounds'
    req.flash('success', 'Welcome back!')
    if (redirectUrl.slice(-15) === '?_method=DELETE') {
        return res.redirect(307, redirectUrl)
    }
    res.redirect(redirectUrl)
}

module.exports.logout = function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Logged out!')
        res.redirect('/campgrounds')
    })
}