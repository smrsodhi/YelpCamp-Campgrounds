const express = require('express')

const ExpressError = require('../utils/ExpressError')

const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')

const Campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas')

const validateReview = function (req, res, next) {
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

// CREATE
router.post('/', validateReview, catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// DESTROY
router.delete('/:reviewId', catchAsync(async function (req, res) {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router