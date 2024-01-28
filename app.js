const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./schemas')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

app.engine('ejs', ejsMate)

app.listen(3000, function () {
    console.log('LISTENING ON PORT 3000')
})

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('Database connected')
})

const validateCampground = function (req, res, next) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(function (element) {
            return element.message
        }
        ).join(',')
        throw new ExpressError(message, 400)
    } else {
        next()
    }
}

// HOME
app.get('/', function (req, res) {
    res.render('home')
})

// INDEX
app.get('/campgrounds', catchAsync(async function (req, res, next) {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// NEW
app.get('/campgrounds/new', function (req, res) {
    res.render('campgrounds/new')
})

// CREATE
app.post('/campgrounds', validateCampground, catchAsync(async function (req, res, next) {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

// SHOW
app.get('/campgrounds/:id', catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
}))

// EDIT
app.get('/campgrounds/:id/edit', catchAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

// UPDATE
app.put('/campgrounds/:id', validateCampground, catchAsync(async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

// DESTROY
app.delete('/campgrounds/:id', catchAsync(async function (req, res) {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))

app.all('*', function (req, res, next) {
    next(new ExpressError('Page Not Found', 404))
})

// ERROR HANDLING MIDDLEWARE
app.use(function (err, req, res, next) {
    const { statusCode = 500 } = err
    if (!err.message) {
        err.message = 'Something went wrong!'
    }
    res.status(statusCode).render('error', { err })
})