import UserModel from "../models/user.model.js";
import FarmerModel from "../models/farmer.model.js";
import DeliveryPartnerModel from "../models/deliveryPartner.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await UserModel.countDocuments();
        const totalFarmers = await UserModel.countDocuments({ role: 'FARMER' });
        const totalDeliveries = await UserModel.countDocuments({ role: 'DELIVERY_PARTNER' });
        const totalProducts = await ProductModel.countDocuments();
        const totalOrdersCount = await OrderModel.countDocuments();

        // Calculate revenue
        const orders = await OrderModel.find({ status: 'delivered' });
        let totalRevenue = 0;
        orders.forEach(order => {
            totalRevenue += order.totalAmt;
        });

        // Platform fee cut is 10% of total revenue
        const platformEarnings = totalRevenue * 0.10;

        const pendingFarmers = await FarmerModel.countDocuments({ verified: 'pending' });
        const pendingDelivery = await DeliveryPartnerModel.countDocuments({ verified: 'pending' });

        return res.json({
            message: "Admin statistics retrieved",
            error: false,
            success: true,
            data: {
                totalUsers,
                totalFarmers,
                totalDeliveries,
                totalProducts,
                totalOrdersCount,
                totalRevenue,
                platformEarnings,
                pendingVerifications: pendingFarmers + pendingDelivery
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getUsersList = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password -refresh_token').sort({ createdAt: -1 });
        return res.json({
            message: "Users retrieved successfully",
            error: false,
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { userId, status } = req.body; // Active, Inactive, Suspended

        if (!userId || !status) {
            return res.status(400).json({
                message: "Provide user ID and status",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: `User status updated to ${status}`,
            error: false,
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getPendingVerifications = async (req, res) => {
    try {
        const farmers = await FarmerModel.find({ verified: 'pending' }).populate('user_id', 'name email mobile');
        const delivery = await DeliveryPartnerModel.find({ verified: 'pending' }).populate('user_id', 'name email mobile');

        return res.json({
            message: "Pending verifications retrieved",
            error: false,
            success: true,
            data: {
                farmers,
                delivery
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const verifyPartner = async (req, res) => {
    try {
        const { type, id, action } = req.body; // type: 'farmer' / 'delivery', id: profileId, action: 'approved' / 'rejected'

        if (!type || !id || !action) {
            return res.status(400).json({
                message: "Provide type, id, and action",
                error: true,
                success: false
            });
        }

        let result;
        if (type === 'farmer') {
            result = await FarmerModel.findByIdAndUpdate(id, { verified: action }, { new: true }).populate('user_id');
            if (result && action === 'approved') {
                await UserModel.findByIdAndUpdate(result.user_id._id, { role: 'FARMER' });
            }
        } else if (type === 'delivery') {
            result = await DeliveryPartnerModel.findByIdAndUpdate(id, { verified: action }, { new: true }).populate('user_id');
            if (result && action === 'approved') {
                await UserModel.findByIdAndUpdate(result.user_id._id, { role: 'DELIVERY_PARTNER' });
            }
        } else {
            return res.status(400).json({
                message: "Invalid verification type",
                error: true,
                success: false
            });
        }

        if (!result) {
            return res.status(404).json({
                message: "Profile not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: `Partner verification set to ${action}`,
            error: false,
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
