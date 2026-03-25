const Spot = require('../models/spot');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
        req.flash('error', 'Cannot find that spot.');
        return res.redirect('/spots');
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;
    spot.reviews.push(review);

    await review.save();
    await spot.save();
    await Spot.syncRatingStats(spot._id);

    req.flash('success', 'Review added to your diary entry.');
    res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Spot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    await Spot.syncRatingStats(id);

    req.flash('success', 'Review removed.');
    res.redirect(`/spots/${id}`);
};
