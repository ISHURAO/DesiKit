import BannerModel from "../models/banner.model.js";

export const addBanner = async (req, res) => {
    try {
        const { title, image, product_link } = req.body;

        if (!image) {
            return res.status(400).json({
                message: "Provide banner image URL",
                error: true,
                success: false
            });
        }

        const newBanner = new BannerModel({
            title: title || "",
            image,
            product_link: product_link || ""
        });
        await newBanner.save();

        return res.json({
            message: "Banner added successfully",
            error: false,
            success: true,
            data: newBanner
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getBanners = async (req, res) => {
    try {
        const list = await BannerModel.find({ active: true });
        return res.json({
            message: "Banners retrieved successfully",
            error: false,
            success: true,
            data: list
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { bannerId } = req.params;

        const deleted = await BannerModel.findByIdAndDelete(bannerId);
        if (!deleted) {
            return res.status(404).json({
                message: "Banner not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Banner deleted successfully",
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
