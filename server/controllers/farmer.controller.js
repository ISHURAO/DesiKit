import FarmerModel from "../models/farmer.model.js";
import sendEmail from "../config/sendEmail.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

export const getFarmerStats = async (req, res) => {
    try {
        const userId = req.userId; // User ref who is a farmer
        const farmer = await FarmerModel.findOne({ user_id: userId });

        if (!farmer) {
            return res.status(404).json({
                message: "Farmer profile not found",
                error: true,
                success: false
            });
        }

        const totalProducts = await ProductModel.countDocuments({ farmer_id: userId });

        // Find orders containing this farmer's products
        const orders = await OrderModel.find({ "items.farmerId": userId });

        let totalEarnings = farmer.earnings;
        let totalSalesCount = 0;
        let activeOrdersCount = 0;

        orders.forEach(order => {
            if (order.status !== 'cancelled') {
                order.items.forEach(item => {
                    if (item.farmerId && item.farmerId.toString() === userId.toString()) {
                        totalSalesCount += item.quantity;
                    }
                });
                if (order.status !== 'delivered') {
                    activeOrdersCount++;
                }
            }
        });

        return res.json({
            message: "Farmer stats retrieved",
            error: false,
            success: true,
            data: {
                farm_name: farmer.farm_name,
                farm_address: farmer.farm_address,
                verified: farmer.verified,
                license_doc: farmer.license_doc,
                earnings: totalEarnings,
                totalProducts,
                totalSalesCount,
                activeOrdersCount
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

export const submitFarmerVerification = async (req, res) => {
    try {
        const userId = req.userId;
        const { farm_name, farm_address, license_doc } = req.body;

        if (!farm_name || !farm_address) {
            return res.status(400).json({
                message: "Provide farm name and farm address",
                error: true,
                success: false
            });
        }

        const farmer = await FarmerModel.findOneAndUpdate(
            { user_id: userId },
            {
                farm_name,
                farm_address,
                license_doc: license_doc || "",
                verified: 'pending'
            },
            { new: true, upsert: true }
        );

        return res.json({
            message: "Verification request submitted successfully",
            error: false,
            success: true,
            data: farmer
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getFarmerOrders = async (req, res) => {
    try {
        const userId = req.userId;
        // Retrieve orders containing products owned by this farmer
        const orders = await OrderModel.find({ "items.farmerId": userId })
            .populate('userId', 'name email mobile')
            .populate('delivery_partner_id', 'name email mobile')
            .populate('delivery_address')
            .sort({ createdAt: -1 });

        // Filter items in each order to only show what belongs to this farmer (optional, but let's keep all details and mark items clearly)
        return res.json({
            message: "Farmer orders retrieved",
            error: false,
            success: true,
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const updateFarmerOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body; // e.g. packed

        if (!orderId || !status) {
            return res.status(400).json({
                message: "Provide order ID and status",
                error: true,
                success: false
            });
        }

        if (status !== 'packed' && status !== 'confirmed') {
            return res.status(400).json({
                message: "Farmers can only mark orders as confirmed or packed",
                error: true,
                success: false
            });
        }

        const order = await OrderModel.findOneAndUpdate({ orderId }, { status }, { new: true });
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Fetch buyer and notify via email
        try {
            const buyer = await UserModel.findById(order.userId);
            if (buyer && buyer.email) {
                await sendEmail({
                    sendTo: buyer.email,
                    subject: `DesiKit - Order Update #${orderId}`,
                    html: `<p>Hello ${buyer.name}, your DesiKit order <strong>${orderId}</strong> has been updated to: <strong>${status.toUpperCase()}</strong> by the farmer.</p>`
                });
            }
        } catch (e) {
            console.error("Framer order alert email error:", e);
        }

        return res.json({
            message: `Order marked as ${status}`,
            error: false,
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getAvailableDeliveryPartners = async (req, res) => {
    try {
        // Find verified delivery partners
        const partners = await UserModel.find({ role: 'DELIVERY_PARTNER', status: 'Active' }).select('name email mobile avatar');
        return res.json({
            message: "Delivery partners retrieved",
            error: false,
            success: true,
            data: partners
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId, deliveryPartnerId } = req.body;

        if (!orderId || !deliveryPartnerId) {
            return res.status(400).json({
                message: "Provide order ID and delivery partner ID",
                error: true,
                success: false
            });
        }

        const partner = await UserModel.findById(deliveryPartnerId);
        if (!partner || partner.role !== 'DELIVERY_PARTNER') {
            return res.status(400).json({
                message: "Invalid delivery partner selection",
                error: true,
                success: false
            });
        }

        const order = await OrderModel.findOneAndUpdate(
            { orderId },
            { delivery_partner_id: deliveryPartnerId },
            { new: true }
        );

        return res.json({
            message: "Delivery partner assigned successfully",
            error: false,
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
