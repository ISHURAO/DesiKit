import DeliveryPartnerModel from "../models/deliveryPartner.model.js";
import sendEmail from "../config/sendEmail.js";
import OrderModel from "../models/order.model.js";
import WalletModel from "../models/wallet.model.js";
import FarmerModel from "../models/farmer.model.js";
import UserModel from "../models/user.model.js";

export const getDeliveryStats = async (req, res) => {
    try {
        const userId = req.userId;
        const delivery = await DeliveryPartnerModel.findOne({ user_id: userId });

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery partner profile not found",
                error: true,
                success: false
            });
        }

        const totalDeliveries = await OrderModel.countDocuments({
            delivery_partner_id: userId,
            status: 'delivered'
        });

        const activeDeliveries = await OrderModel.countDocuments({
            delivery_partner_id: userId,
            status: { $in: ['packed', 'out_for_delivery'] }
        });

        return res.json({
            message: "Delivery partner stats retrieved",
            error: false,
            success: true,
            data: {
                vehicle_details: delivery.vehicle_details,
                vehicle_number: delivery.vehicle_number,
                verified: delivery.verified,
                earnings: delivery.earnings,
                totalDeliveries,
                activeDeliveries,
                live_location: delivery.live_location
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

export const submitDeliveryVerification = async (req, res) => {
    try {
        const userId = req.userId;
        const { vehicle_details, vehicle_number } = req.body;

        if (!vehicle_details) {
            return res.status(400).json({
                message: "Provide vehicle details",
                error: true,
                success: false
            });
        }

        const delivery = await DeliveryPartnerModel.findOneAndUpdate(
            { user_id: userId },
            {
                vehicle_details,
                vehicle_number: vehicle_number || "",
                verified: 'pending'
            },
            { new: true, upsert: true }
        );

        return res.json({
            message: "Verification documents submitted",
            error: false,
            success: true,
            data: delivery
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getAssignedOrders = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Find orders assigned to this rider, or packed orders awaiting dispatch
        const list = await OrderModel.find({
            $or: [
                { delivery_partner_id: userId },
                { delivery_partner_id: null, status: 'packed', delivery_type: 'home_delivery' }
            ]
        })
        .populate('userId', 'name email mobile')
        .populate('delivery_address')
        .sort({ createdAt: -1 });

        return res.json({
            message: "Assigned orders retrieved",
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

export const acceptDeliveryOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        const order = await OrderModel.findOneAndUpdate(
            { orderId },
            { delivery_partner_id: userId },
            { new: true }
        );

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
                    subject: `DesiKit - Order Accepted by Delivery Partner #${orderId}`,
                    html: `<p>Hello ${buyer.name}, your DesiKit order <strong>${orderId}</strong> has been accepted by our delivery partner and is on its way. Delivery Verification OTP: <strong>${order.delivery_otp}</strong></p>`
                });
            }
        } catch (e) {
            console.error("Delivery accept email error:", e);
        }

        return res.json({
            message: "Job offer accepted successfully",
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

export const updateDeliveryOrderStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId, status, otp } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                message: "Provide order ID and status",
                error: true,
                success: false
            });
        }

        const order = await OrderModel.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        if (status === 'out_for_delivery') {
            order.status = 'out_for_delivery';
            await order.save();

            // Notify buyer
            try {
                const buyer = await UserModel.findById(order.userId);
                if (buyer && buyer.email) {
                    await sendEmail({
                        sendTo: buyer.email,
                        subject: `DesiKit - Order #${orderId} is Out for Delivery`,
                        html: `<p>Hello ${buyer.name}, your DesiKit order <strong>${orderId}</strong> is out for delivery! The rider is approaching your address. Delivery Verification OTP: <strong>${order.delivery_otp}</strong></p>`
                    });
                }
            } catch (e) {
                console.error("Out for delivery email error:", e);
            }

            return res.json({
                message: "Order is now out for delivery",
                error: false,
                success: true,
                data: order
            });
        }

        if (status === 'delivered') {
            if (!otp) {
                return res.status(400).json({
                    message: "Verification OTP is required to mark delivered",
                    error: true,
                    success: false
                });
            }

            if (order.delivery_otp !== otp) {
                return res.status(400).json({
                    message: "Invalid verification OTP",
                    error: true,
                    success: false
                });
            }

            order.status = 'delivered';
            order.payment_status = 'completed'; // Mark payment done
            await order.save();

            // Notify buyer
            try {
                const buyer = await UserModel.findById(order.userId);
                if (buyer && buyer.email) {
                    await sendEmail({
                        sendTo: buyer.email,
                        subject: `DesiKit - Order #${orderId} Delivered Successfully`,
                        html: `<p>Hello ${buyer.name}, your DesiKit order <strong>${orderId}</strong> has been successfully delivered. Thank you for supporting direct local farmers!</p>`
                    });
                }
            } catch (e) {
                console.error("Delivered email error:", e);
            }

            // Credit Delivery Partner Earnings: standard ₹40 per delivery
            await DeliveryPartnerModel.findOneAndUpdate({ user_id: userId }, { $inc: { earnings: 40 } });

            // Credit Farmers' Earnings for each product in the order
            for (const item of order.items) {
                if (item.farmerId) {
                    const itemTotal = item.price * item.quantity;
                    // Deduct a small platform fee (e.g. 10%), credit 90% of product price to farmer
                    const farmerCut = itemTotal * 0.90;
                    await FarmerModel.findOneAndUpdate({ user_id: item.farmerId }, { $inc: { earnings: farmerCut } });
                }
            }

            return res.json({
                message: "Order delivered successfully! Earnings updated.",
                error: false,
                success: true,
                data: order
            });
        }

        return res.status(400).json({
            message: "Invalid status transition for delivery partner",
            error: true,
            success: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const updateDeliveryLocation = async (req, res) => {
    try {
        const userId = req.userId;
        const { lat, lng } = req.body;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                message: "Provide lat and lng coordinates",
                error: true,
                success: false
            });
        }

        const delivery = await DeliveryPartnerModel.findOneAndUpdate(
            { user_id: userId },
            { live_location: { lat, lng } },
            { new: true, upsert: true }
        );

        // Update active orders in transit
        await OrderModel.updateMany(
            { delivery_partner_id: userId, status: 'out_for_delivery' },
            { rider_latitude: lat, rider_longitude: lng }
        );

        return res.json({
            message: "Location updated successfully",
            error: false,
            success: true,
            data: delivery.live_location
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
