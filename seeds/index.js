const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

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
        const campground = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomIdx].city}, ${cities[randomIdx].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dd1iog6jn/image/upload/v1707398510/YelpCamp/blkmnppeotaeqn11cyto.jpg',
                    filename: 'YelpCamp/blkmnppeotaeqn11cyto'
                },
                {
                    url: 'https://res.cloudinary.com/dd1iog6jn/image/upload/v1707398510/YelpCamp/fpwolmgn57ibfejscnb1.jpg',
                    filename: 'YelpCamp/fpwolmgn57ibfejscnb1'
                }
            ],
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