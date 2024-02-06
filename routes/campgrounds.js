const express = require('express')

const catchAsync = require('../utils/catchAsync')
const { validateCampground, isLoggedIn, isOwner } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')

const router = express.Router()

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.create))
    
router.get('/new', isLoggedIn, campgrounds.new)
    
router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isOwner, validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, catchAsync(campgrounds.destroy))


router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campgrounds.edit))

module.exports = router