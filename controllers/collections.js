const User = require('../models/user');
const Spot = require('../models/spot');

function findCollection(user, collectionId) {
    return user.collections.id(collectionId);
}

module.exports.index = async (req, res) => {
    const user = await User.findById(req.user._id).populate('collections.spots');

    res.render('collections/index', {
        collections: user.collections
    });
};

module.exports.showCollection = async (req, res) => {
    const user = await User.findById(req.user._id).populate('collections.spots');
    const collection = findCollection(user, req.params.collectionId);

    if (!collection) {
        req.flash('error', 'Cannot find that collection.');
        return res.redirect('/collections');
    }

    res.render('collections/show', {
        collection
    });
};

module.exports.createCollection = async (req, res) => {
    const { name, description, spotId } = req.body;
    const user = await User.findById(req.user._id);

    const collection = {
        name: name?.trim(),
        description: description?.trim() || '',
        spots: []
    };

    if (spotId) {
        const spot = await Spot.findById(spotId);
        if (spot) {
            collection.spots.push(spot._id);
        }
    }

    user.collections.push(collection);
    await user.save();
    req.user = await User.findById(req.user._id);

    req.flash('success', 'Collection created.');
    if (spotId) {
        return res.redirect(`/spots/${spotId}`);
    }
    res.redirect('/collections');
};

module.exports.addSpotToCollection = async (req, res) => {
    const { collectionId } = req.params;
    const { spotId } = req.body;
    const user = await User.findById(req.user._id);
    const collection = findCollection(user, collectionId);

    if (!collection) {
        req.flash('error', 'Cannot find that collection.');
        return res.redirect('/collections');
    }

    const exists = collection.spots.some(savedSpotId => String(savedSpotId) === String(spotId));
    if (!exists) {
        collection.spots.push(spotId);
        await user.save();
    }

    req.user = await User.findById(req.user._id);
    req.flash('success', 'Spot added to collection.');
    res.redirect(`/spots/${spotId}`);
};

module.exports.removeSpotFromCollection = async (req, res) => {
    const { collectionId, spotId } = req.params;
    const user = await User.findById(req.user._id);
    const collection = findCollection(user, collectionId);

    if (!collection) {
        req.flash('error', 'Cannot find that collection.');
        return res.redirect('/collections');
    }

    collection.spots = collection.spots.filter(savedSpotId => String(savedSpotId) !== String(spotId));
    await user.save();
    req.flash('success', 'Spot removed from collection.');
    res.redirect(`/collections/${collectionId}`);
};
