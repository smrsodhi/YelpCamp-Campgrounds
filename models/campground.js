const mongoose = require('mongoose')

const CampgroundSchema = new mongoose.Schema({
    title: String,
    location: String,
    image: String,
    description: String,
    price: Number
})

const Campground = mongoose.model('Campground', CampgroundSchema)

module.exports = Campground