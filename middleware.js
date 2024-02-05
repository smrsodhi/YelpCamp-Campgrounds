const ExpressError = require('./utils/ExpressError')

const Campground = require('./models/campground')
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./schemas')

module.exports.validateCampground = function (req, res, next) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(function (element) {
            return element.message
        }).join(',')
        throw new ExpressError(message, 400)
    } else {
        next()
    }
}

module.exports.validateReview = function (req, res, next) {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const message = error.details.map(function (element) {
            return element.message
        }).join(',')
        throw new ExpressError(message, 400)
    } else {
        next()
    }
}

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

module.exports.isOwner = async function (req, res, next) {
    const campground = await Campground.findById(req.params.id)
    if (!campground.owner.equals(req.user._id)) {
        req.flash('error', `You don't have permission to do that!`)
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next()
}

module.exports.isAuthor = async function(req, res, next) {
    const review = await Review.findById(req.params.reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', `You don't have permission to do that!`)
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    next()
}