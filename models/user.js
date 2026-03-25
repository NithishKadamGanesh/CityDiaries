const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const SavedSpotSchema = new Schema({
    spot: {
        type: Schema.Types.ObjectId,
        ref: 'Spot',
        required: true
    },
    status: {
        type: String,
        enum: ['want_to_visit', 'visited', 'recommended'],
        default: 'want_to_visit'
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const CollectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    spots: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Spot'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    favorites: [SavedSpotSchema],
    collections: [CollectionSchema]
}, { timestamps: true });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
