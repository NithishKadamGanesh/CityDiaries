const Joi = require('joi');
const { SPOT_CATEGORIES } = require('./utils/constants');

module.exports.spotSchema = Joi.object({
    spot: Joi.object({
        title: Joi.string().trim().min(3).max(80).required(),
        category: Joi.string().valid(...SPOT_CATEGORIES).required(),
        location: Joi.string().trim().min(2).max(120).required(),
        description: Joi.string().trim().min(20).max(800).required()
    }).required(),
    deleteImages: Joi.array().items(Joi.string())
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().trim().min(5).max(500).required()
    }).required()
});
