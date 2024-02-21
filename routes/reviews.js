const express = require('express')

const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isAuthor } = require('../middleware')

const router = express.Router({ mergeParams: true })

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.create))
router.delete('/:reviewId', isLoggedIn, isAuthor, catchAsync(reviews.destroy))

module.exports = router