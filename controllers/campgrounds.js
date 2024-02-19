const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const { cloudinary } = require('../cloudinary')

const mbxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mbxToken })

module.exports.index = async function (req, res, next) {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.new = function (req, res) {
    res.render('campgrounds/new')
}

module.exports.create = async function (req, res, next) {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(function (file) {
        return {
            url: file.path,
            filename: file.filename
        }
    })
    campground.owner = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.show = async function (req, res) {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('owner')
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.edit = async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.update = async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    const images = req.files.map(function (file) {
        return {
            url: file.path,
            filename: file.filename
        }
    })
    campground.images.push(...images)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save()
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.destroy = async function (req, res) {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}