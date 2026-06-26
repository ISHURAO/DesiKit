import CouponModel from "../models/coupon.model.js";

export const createCoupon = async (req, res) => {
    try {
        const { code, discount_value, discount_type, min_order_value, expiry_date } = req.body;

        if (!code || !discount_value || !expiry_date) {
            return res.status(400).json({
                message: "Provide code, discount value, and expiry date",
                error: true,
                success: false
            });
        }

        const existing = await CouponModel.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                message: "Coupon code already exists",
                error: true,
                success: false
            });
        }

        const newCoupon = new CouponModel({
            code: code.toUpperCase(),
            discount_value,
            discount_type: discount_type || 'percentage',
            min_order_value: min_order_value || 0,
            expiry_date
        });
        await newCoupon.save();

        return res.json({
            message: "Coupon created successfully",
            error: false,
            success: true,
            data: newCoupon
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const coupons = await CouponModel.find({ active: true, expiry_date: { $gte: new Date() } });
        return res.json({
            message: "Active coupons retrieved",
            error: false,
            success: true,
            data: coupons
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { code, order_amount } = req.body;

        if (!code || !order_amount) {
            return res.status(400).json({
                message: "Provide coupon code and order amount",
                error: true,
                success: false
            });
        }

        const coupon = await CouponModel.findOne({ code: code.toUpperCase(), active: true });

        if (!coupon) {
            return res.status(400).json({
                message: "Coupon not found or inactive",
                error: true,
                success: false
            });
        }

        if (new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({
                message: "Coupon has expired",
                error: true,
                success: false
            });
        }

        if (parseFloat(order_amount) < coupon.min_order_value) {
            return res.status(400).json({
                message: `Minimum order amount of ₹${coupon.min_order_value} required`,
                error: true,
                success: false
            });
        }

        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (coupon.discount_value / 100) * parseFloat(order_amount);
        } else {
            discount = coupon.discount_value;
        }

        // Limit discount to order amount
        if (discount > order_amount) {
            discount = order_amount;
        }

        return res.json({
            message: "Coupon applied successfully",
            error: false,
            success: true,
            discount,
            coupon
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
