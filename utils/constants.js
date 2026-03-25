const SPOT_CATEGORIES = [
    'Food',
    'Attraction',
    'Adventure And Sports',
    'Exhibition',
    'NGO',
    'Nightlife',
    'Shopping',
    'Nature'
];

const SORT_OPTIONS = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    rating: { ratingAverage: -1, ratingCount: -1, createdAt: -1 },
    reviews: { ratingCount: -1, createdAt: -1 },
    title: { title: 1 }
};

module.exports = {
    SPOT_CATEGORIES,
    SORT_OPTIONS
};
