const express = require('express')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')

const path = require('path')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

const app = express()

app.engine('ejs', ejsMate)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: 'false',
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(function (req, res, next) {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// HOME
app.get('/', function (req, res) {
    res.render('home')
})

// CAMPGROUNDS
app.use('/campgrounds', campgrounds)

// REVIEWS
app.use('/campgrounds/:id/reviews', reviews)

// PAGE NOT FOUND
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

/* -------------------- DO NOT EVER TOUCH THIS PART -------------------- */

app.listen(3000, function () {
    console.log('LISTENING ON PORT 3000')
})

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('Database connected')
})