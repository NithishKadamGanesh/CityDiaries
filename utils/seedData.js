const Spot = require('../models/spot');
const Review = require('../models/review');
const User = require('../models/user');

const sampleSpots = [
    {
        title: 'Skyline Rooftop Cafe',
        category: 'Food',
        location: 'New York, USA',
        description: 'A cozy rooftop cafe with late-night city views, coffee, and small plates that work well after a long walk downtown.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
                filename: 'seed-skyline-cafe'
            }
        ]
    },
    {
        title: 'Harbor Light Walk',
        category: 'Nature',
        location: 'Sydney, Australia',
        description: 'A breezy waterfront walk that is best around sunset, with easy access to local food spots and quiet viewpoints.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                filename: 'seed-harbor-light'
            }
        ]
    },
    {
        title: 'Old Town Book Arcade',
        category: 'Shopping',
        location: 'Prague, Czech Republic',
        description: 'An atmospheric little arcade full of used books, stationery, and corners that feel made for journaling.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=80',
                filename: 'seed-book-arcade'
            }
        ]
    }
];

async function seedDatabase() {
    const [userCount, spotCount] = await Promise.all([
        User.countDocuments({}),
        Spot.countDocuments({})
    ]);

    if (userCount || spotCount) {
        return;
    }

    const demoUser = new User({
        username: 'demo',
        email: 'demo@citydiaries.local'
    });

    const registeredUser = await User.register(demoUser, 'citydiaries123');

    for (const spotData of sampleSpots) {
        const spot = new Spot({
            ...spotData,
            author: registeredUser._id
        });

        await spot.save();

        const review = new Review({
            body: `Saved this in CityDiaries because it feels like the kind of place you remember long after the trip ends.`,
            rating: 4 + (spot.category === 'Food' ? 1 : 0),
            author: registeredUser._id
        });

        await review.save();
        spot.reviews.push(review._id);
        await spot.save();
        await Spot.syncRatingStats(spot._id);
    }
}

module.exports = seedDatabase;
