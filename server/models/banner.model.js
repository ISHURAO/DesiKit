import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: [true, "Provide banner image URL"]
    },
    product_link: {
        type: String,
        default: ""
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const BannerModel = mongoose.model('banner', bannerSchema);

export default BannerModel;
