import WishlistModel from "../models/wishlist.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "Provide product ID",
                error: true,
                success: false
            });
        }

        let wishlist = await WishlistModel.findOne({ userId });

        if (!wishlist) {
            wishlist = new WishlistModel({ userId, products: [] });
        }

        if (wishlist.products.includes(productId)) {
            return res.json({
                message: "Product already in wishlist",
                error: true,
                success: false
            });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        return res.json({
            message: "Added to wishlist",
            error: false,
            success: true,
            data: wishlist
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "Provide product ID",
                error: true,
                success: false
            });
        }

        let wishlist = await WishlistModel.findOne({ userId });

        if (!wishlist) {
            return res.status(400).json({
                message: "Wishlist not found",
                error: true,
                success: false
            });
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        return res.json({
            message: "Removed from wishlist",
            error: false,
            success: true,
            data: wishlist
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const wishlist = await WishlistModel.findOne({ userId }).populate('products');

        return res.json({
            message: "Wishlist retrieved",
            error: false,
            success: true,
            data: wishlist ? wishlist.products : []
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
