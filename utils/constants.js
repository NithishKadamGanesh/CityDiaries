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

const SAVED_SPOT_STATUSES = [
    { value: 'want_to_visit', label: 'Want to visit' },
    { value: 'visited', label: 'Visited' },
    { value: 'recommended', label: 'Recommended' }
];

module.exports = {
    SPOT_CATEGORIES,
    SORT_OPTIONS,
    SAVED_SPOT_STATUSES
};
