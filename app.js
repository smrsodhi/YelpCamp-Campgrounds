const express = require('express')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const mongoose = require('mongoose')
const ExpressError = require('./utils/ExpressError')

const path = require('path')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const app = express()

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

app.engine('ejs', ejsMate)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function (req, res, next) {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// HOME
app.get('/', function (req, res) {
    res.render('home')
})

// CAMPGROUNDS
app.use('/campgrounds', campgroundRoutes)

// REVIEWS
app.use('/campgrounds/:id/reviews', reviewRoutes)

// USERS
app.use('/', userRoutes)

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