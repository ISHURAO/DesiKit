import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Provide product rating"]
    },
    comment: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Enforce unique review per product per user
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const ReviewModel = mongoose.model('review', reviewSchema);

export default ReviewModel;
