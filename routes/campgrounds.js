const express = require('express')

const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const { validateCampground, isLoggedIn, isOwner } = require('../middleware')

const router = express.Router()

// INDEX
router.get('/', catchAsync(async function (req, res, next) {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// NEW
router.get('/new', isLoggedIn, function (req, res) {
    res.render('campgrounds/new')
})

// CREATE
router.post('/', isLoggedIn, validateCampground, catchAsync(async function (req, res, next) {
    const campground = new Campground(req.body.campground)
    campground.owner = req.user._id
    await campground.save()
    req.flash('success', 'Successfully created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// SHOW
router.get('/:id', catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('owner')
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

// EDIT
router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

// UPDATE
router.put('/:id', isLoggedIn, isOwner, validateCampground, catchAsync(async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

// DESTROY
router.delete('/:id', isLoggedIn, catchAsync(async function (req, res) {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router