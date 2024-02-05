module.exports.isLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeRedirectUrl = function (req, res, next) {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}