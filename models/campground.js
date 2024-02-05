const mongoose = require('mongoose')
const Review = require('./review')

const Schema = mongoose.Schema

const campgroundSchema = new Schema({
    title: String,
    location: String,
    image: String,
    description: String,
    price: Number,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews } })
    }
})

module.exports = mongoose.model('Campground', campgroundSchema)