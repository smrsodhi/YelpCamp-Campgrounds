if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose')

const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const mbxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mbxToken })

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () { 
    console.log('Database connected') 
})

const sample = function (array) {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async function () {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const randomIdx = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const geoData = await geoCoder.forwardGeocode({
            query: `${cities[randomIdx].city}, ${cities[randomIdx].state}`,
            limit: 1
        }).send()
        const campground = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomIdx].city}, ${cities[randomIdx].state}`,
            geometry: geoData.body.features[0].geometry,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique sequi vero suscipit expedita deleniti modi aliquam illo magnam aspernatur esse explicabo ab blanditiis, temporibus ut voluptatem in fugit a placeat.',
            price,
            owner: '65c0de10327e2b9dfd9d5158'
        })
        await campground.save()
    }
}

seedDB().then(function () { 
    mongoose.connection.close() 
})