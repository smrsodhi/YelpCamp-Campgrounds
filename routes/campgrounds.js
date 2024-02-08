const express = require('express')
const multer = require('multer')

const catchAsync = require('../utils/catchAsync')
const { validateCampground, isLoggedIn, isOwner } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const { storage } = require('../cloudinary')

const router = express.Router()
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.create))

router.get('/new', isLoggedIn, campgrounds.new)

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isOwner, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, catchAsync(campgrounds.destroy))


router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campgrounds.edit))

module.exports = router