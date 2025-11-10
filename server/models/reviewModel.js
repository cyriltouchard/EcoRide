const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, "Une note est requise."],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

