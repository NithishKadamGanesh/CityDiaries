const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const SpotSchema = new Schema({
    title: String,
    images: [ImageSchema],
    category: String,
    description: String,
    location: String,
    ratingAverage: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { timestamps: true });

SpotSchema.virtual('coverImage').get(function () {
    if (this.images && this.images.length) {
        return this.images[0].url;
    }

    return 'https://images.unsplash.com/photo-1609642779314-20faa2c9a7cd?auto=format&fit=crop&w=1300&q=80';
});

SpotSchema.statics.syncRatingStats = async function (spotId) {
    const spot = await this.findById(spotId).populate('reviews');
    if (!spot) return;

    const ratingCount = spot.reviews.length;
    const total = spot.reviews.reduce((sum, review) => sum + review.rating, 0);
    const ratingAverage = ratingCount ? Number((total / ratingCount).toFixed(1)) : 0;

    spot.ratingCount = ratingCount;
    spot.ratingAverage = ratingAverage;
    await spot.save();
};

SpotSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Spot', SpotSchema);
