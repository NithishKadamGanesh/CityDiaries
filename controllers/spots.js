const fs = require('fs/promises');
const path = require('path');
const Spot = require('../models/spot');
const User = require('../models/user');
const { cloudinary, hasCloudinaryConfig, formatUploadedFiles } = require("../cloudinary");
const { SPOT_CATEGORIES, SORT_OPTIONS } = require('../utils/constants');

const PAGE_SIZE = 6;

function escapeRegExp(value = '') {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeFilters(query = {}) {
    return {
        q: (query.q || '').trim(),
        category: query.category || '',
        sort: SORT_OPTIONS[query.sort] ? query.sort : 'newest',
        page: Math.max(parseInt(query.page, 10) || 1, 1)
    };
}

function buildSpotQuery(filters, currentUserId) {
    const query = {};

    if (currentUserId) {
        query.author = currentUserId;
    }

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.q) {
        const regex = new RegExp(escapeRegExp(filters.q), 'i');
        query.$or = [
            { title: regex },
            { location: regex },
            { description: regex }
        ];
    }

    return query;
}

function buildPagination(page, total) {
    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
    const currentPage = Math.min(page, totalPages);

    return {
        currentPage,
        totalPages,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: currentPage - 1,
        nextPage: currentPage + 1
    };
}

function buildQueryString(filters, nextPage) {
    const params = new URLSearchParams();

    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (nextPage > 1) params.set('page', nextPage);

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

async function removeLocalImages(filenames = []) {
    await Promise.all(filenames.map(async filename => {
        try {
            await fs.unlink(path.join(__dirname, '..', 'public', 'uploads', filename));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }));
}

async function renderSpotCollection(res, {
    filters,
    currentUserId,
    customQuery,
    pageTitle,
    intro,
    emptyState,
    actionHref,
    actionLabel,
    isDiary
}) {
    const query = customQuery || buildSpotQuery(filters, currentUserId);
    const total = await Spot.countDocuments(query);
    const pagination = buildPagination(filters.page, total);
    const sort = SORT_OPTIONS[filters.sort] || SORT_OPTIONS.newest;

    const spots = await Spot.find(query)
        .populate('author')
        .sort(sort)
        .skip((pagination.currentPage - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE);

    res.render('spots/index', {
        spots,
        filters,
        categories: SPOT_CATEGORIES,
        pagination,
        pageTitle,
        intro,
        emptyState,
        actionHref,
        actionLabel,
        isDiary,
        buildPageLink: page => buildQueryString(filters, page)
    });
}

function isSpotFavorited(user, spotId) {
    if (!user || !user.favorites) return false;
    return user.favorites.some(favoriteId => favoriteId.equals(spotId));
}

module.exports.index = async (req, res) => {
    const filters = normalizeFilters(req.query);
    await renderSpotCollection(res, {
        filters,
        pageTitle: 'Explore Diaries',
        intro: 'Browse thoughtful place notes, save ideas for later, and find spots worth adding to your own story.',
        emptyState: 'No diary entries match your filters yet. Try another category or a broader search.',
        actionHref: '/spots/new',
        actionLabel: 'Add a new spot',
        isDiary: false
    });
};

module.exports.showMySpots = async (req, res) => {
    const filters = normalizeFilters(req.query);
    await renderSpotCollection(res, {
        filters,
        currentUserId: req.user._id,
        pageTitle: 'My Diary',
        intro: 'Your saved memories, personal recommendations, and places you have already documented.',
        emptyState: 'Your diary is still empty. Add your first spot to start building a personal city guide.',
        actionHref: '/spots/new',
        actionLabel: 'Create my first entry',
        isDiary: true
    });
};

module.exports.showSavedSpots = async (req, res) => {
    const filters = normalizeFilters(req.query);
    const favoriteIds = req.user.favorites || [];

    await renderSpotCollection(res, {
        filters,
        customQuery: {
            _id: { $in: favoriteIds },
            ...buildSpotQuery(filters)
        },
        pageTitle: 'Saved Spots',
        intro: 'A shortlist of places you want to come back to, recommend later, or keep handy for future trips.',
        emptyState: 'You have not saved any spots yet. Open a place entry and tap Save to keep it here.',
        actionHref: '/spots',
        actionLabel: 'Browse all spots',
        isDiary: false
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render('spots/new', {
        categories: SPOT_CATEGORIES
    });
};

module.exports.createSpot = async (req, res) => {
    const spot = new Spot(req.body.spot);
    spot.images = formatUploadedFiles(req.files);
    spot.author = req.user._id;
    await spot.save();

    req.flash('success', 'New diary entry published.');
    res.redirect(`/spots/${spot._id}`);
};

module.exports.showSpot = async (req, res) => {
    const spot = await Spot.findById(req.params.id).populate({
        path: 'reviews',
        options: { sort: { createdAt: -1 } },
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!spot) {
        req.flash('error', 'Cannot find that spot.');
        return res.redirect('/spots');
    }

    res.render('spots/show', {
        spot,
        isFavorited: isSpotFavorited(req.user, spot._id)
    });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const spot = await Spot.findById(id);

    if (!spot) {
        req.flash('error', 'Cannot find that spot.');
        return res.redirect('/spots');
    }

    res.render('spots/edit', {
        spot,
        categories: SPOT_CATEGORIES
    });
};

module.exports.updateSpot = async (req, res) => {
    const { id } = req.params;
    const spot = await Spot.findById(id);

    if (!spot) {
        req.flash('error', 'Cannot find that spot.');
        return res.redirect('/spots');
    }

    Object.assign(spot, req.body.spot);
    const uploadedImages = formatUploadedFiles(req.files);
    spot.images.push(...uploadedImages);

    if (req.body.deleteImages) {
        const deleteImages = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];

        if (hasCloudinaryConfig) {
            await Promise.all(deleteImages.map(filename => cloudinary.uploader.destroy(filename)));
        } else {
            await removeLocalImages(deleteImages);
        }

        spot.images = spot.images.filter(image => !deleteImages.includes(image.filename));
    }

    await spot.save();

    req.flash('success', 'Diary entry updated.');
    res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteSpot = async (req, res) => {
    const { id } = req.params;
    await User.updateMany(
        { favorites: id },
        { $pull: { favorites: id } }
    );
    await Spot.findByIdAndDelete(id);
    req.flash('success', 'Diary entry deleted.');
    res.redirect('/spots');
};

module.exports.toggleFavorite = async (req, res) => {
    const { id } = req.params;
    const spot = await Spot.findById(id);

    if (!spot) {
        req.flash('error', 'Cannot find that spot.');
        return res.redirect('/spots');
    }

    const alreadyFavorited = isSpotFavorited(req.user, spot._id);

    if (alreadyFavorited) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: spot._id } });
        req.flash('success', 'Spot removed from your saved list.');
    } else {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: spot._id } });
        req.flash('success', 'Spot saved for later.');
    }

    req.user = await User.findById(req.user._id);
    res.redirect(`/spots/${spot._id}`);
};
