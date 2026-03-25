const express = require('express');
const router = express.Router();
const collections = require('../controllers/collections');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

router.use(isLoggedIn);

router.get('/', catchAsync(collections.index));
router.post('/', catchAsync(collections.createCollection));
router.get('/:collectionId', catchAsync(collections.showCollection));
router.post('/:collectionId/spots', catchAsync(collections.addSpotToCollection));
router.post('/:collectionId/spots/:spotId/remove', catchAsync(collections.removeSpotFromCollection));

module.exports = router;
