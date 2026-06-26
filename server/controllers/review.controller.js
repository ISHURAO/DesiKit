import ReviewModel from "../models/review.model.js";

export const addReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, rating, comment } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({
                message: "Provide product ID and rating (1-5)",
                error: true,
                success: false
            });
        }

        // Check if review already exists
        let review = await ReviewModel.findOne({ productId, userId });

        if (review) {
            review.rating = rating;
            review.comment = comment || "";
            await review.save();
            return res.json({
                message: "Review updated successfully",
                error: false,
                success: true,
                data: review
            });
        }

        review = new ReviewModel({
            productId,
            userId,
            rating,
            comment: comment || ""
        });
        await review.save();

        return res.json({
            message: "Review added successfully",
            error: false,
            success: true,
            data: review
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await ReviewModel.find({ productId }).populate('userId', 'name avatar');

        // Calculate average rating
        let avgRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = sum / reviews.length;
        }

        return res.json({
            message: "Reviews retrieved successfully",
            error: false,
            success: true,
            data: reviews,
            avgRating: parseFloat(avgRating.toFixed(1)),
            totalReviews: reviews.length
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
