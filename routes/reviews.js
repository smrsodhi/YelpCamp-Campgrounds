const express = require('express')

const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const { validateReview, isLoggedIn, isAuthor } = require('../middleware')

const router = express.Router({ mergeParams: true })

// CREATE
router.post('/', isLoggedIn, validateReview, catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save() 
    await campground.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// DESTROY
router.delete('/:reviewId', isLoggedIn, isAuthor, catchAsync(async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } })
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash('success', 'Deleted review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

module.exports = router