const express = require('express');
const router = express.Router();
const multer = require('multer');
const spots = require('../controllers/spots');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, validateSpot } = require('../middleware');
const { storage } = require('../cloudinary');

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new ExpressError('Only image uploads are allowed.', 400));
        }
        cb(null, true);
    }
});

router.route('/')
    .get(catchAsync(spots.index))
    .post(isLoggedIn, upload.array('image', 6), validateSpot, catchAsync(spots.createSpot));

router.get('/new', isLoggedIn, spots.renderNewForm);
router.get('/myspots', isLoggedIn, catchAsync(spots.showMySpots));
router.get('/saved', isLoggedIn, catchAsync(spots.showSavedSpots));
router.post('/:id/favorite', isLoggedIn, catchAsync(spots.toggleFavorite));
router.post('/:id/saved-status', isLoggedIn, catchAsync(spots.updateSavedSpotStatus));

router.route('/:id')
    .get(catchAsync(spots.showSpot))
    .put(isLoggedIn, isAuthor, upload.array('image', 6), validateSpot, catchAsync(spots.updateSpot))
    .delete(isLoggedIn, isAuthor, catchAsync(spots.deleteSpot));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spots.renderEditForm));

module.exports = router;
