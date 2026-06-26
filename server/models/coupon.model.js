import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Provide coupon code"],
        unique: true,
        uppercase: true,
        trim: true
    },
    discount_value: {
        type: Number,
        required: [true, "Provide discount value"]
    },
    discount_type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    min_order_value: {
        type: Number,
        default: 0
    },
    expiry_date: {
        type: Date,
        required: [true, "Provide expiry date"]
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const CouponModel = mongoose.model('coupon', couponSchema);

export default CouponModel;
