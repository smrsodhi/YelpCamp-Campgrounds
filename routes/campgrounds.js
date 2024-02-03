const express = require('express')

const ExpressError = require('../utils/ExpressError')

const router = express.Router()
const catchAsync = require('../utils/catchAsync')

const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas')

const validateCampground = function (req, res, next) {
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

// INDEX
router.get('/', catchAsync(async function (req, res, next) {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// NEW
router.get('/new', function (req, res) {
    res.render('campgrounds/new')
})

// CREATE
router.post('/', validateCampground, catchAsync(async function (req, res, next) {
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// SHOW
router.get('/:id', catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

// EDIT
router.get('/:id/edit', catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

// UPDATE
router.put('/:id', validateCampground, catchAsync(async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// DESTROY
router.delete('/:id', catchAsync(async function (req, res) {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router