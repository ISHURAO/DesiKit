import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'product'
        }
    ]
}, {
    timestamps: true
});

const WishlistModel = mongoose.model('wishlist', wishlistSchema);

export default WishlistModel;
