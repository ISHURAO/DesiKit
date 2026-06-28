import CartProductModel from "../models/cartproduct.model.js";
import sendEmail from "../config/sendEmail.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import WalletModel from "../models/wallet.model.js";
import NotificationModel from "../models/notification.model.js";
import CouponModel from "../models/coupon.model.js";
import AddressModel from "../models/address.model.js";
import FarmerModel from "../models/farmer.model.js";
import { geocodeAddress, getHaversineDistance } from "../utils/geocoding.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId123",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "mockKeySecret123"
});

// Generate unique ID helper
const makeId = (prefix, length) => {
    return prefix + Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export async function calculateDeliveryFeeInternal(addressId, listItems, deliveryType, isSubscription) {
    if (deliveryType === 'pickup') {
        return { distance: 0, deliveryFee: 0, isFreeEligible: true, freeReason: "Self-Pickup" };
    }

    const totalQty = listItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const hasBulkItem = listItems.some(item => (item.quantity || 1) >= 50);

    if (isSubscription) {
        return { distance: 0, deliveryFee: 0, isFreeEligible: true, freeReason: "Monthly Subscription" };
    }

    if (totalQty >= 50 || hasBulkItem) {
        return { distance: 0, deliveryFee: 0, isFreeEligible: true, freeReason: "Bulk Order" };
    }

    if (!addressId) {
        return { distance: 5, deliveryFee: 40, isFreeEligible: false, freeReason: "" };
    }

    try {
        const address = await AddressModel.findById(addressId);
        if (!address) {
            return { distance: 5, deliveryFee: 40, isFreeEligible: false, freeReason: "" };
        }

        const addressString = `${address.address_line || ''}, ${address.city || ''}, ${address.state || ''}, ${address.pincode || ''}, India`;
        const userCoords = await geocodeAddress(addressString);

        let maxDistance = 0;
        for (const item of listItems) {
            const farmerId = item.productId?.farmer_id || item.farmerId;
            let itemDistance = 0;

            if (farmerId) {
                const farmer = await FarmerModel.findOne({ user_id: farmerId });
                if (farmer && farmer.farm_address) {
                    const farmCoords = await geocodeAddress(farmer.farm_address + ", India");
                    if (userCoords && farmCoords) {
                        itemDistance = getHaversineDistance(userCoords.lat, userCoords.lon, farmCoords.lat, farmCoords.lon);
                    }
                }
            }

            if (itemDistance <= 0) {
                itemDistance = item.productId?.farmDistance || 5;
            }
            if (itemDistance > maxDistance) {
                maxDistance = itemDistance;
            }
        }

        if (maxDistance <= 0) maxDistance = 5;

        // Calculate order subtotal to check ₹200 threshold
        const orderSubtotal = listItems.reduce((sum, item) => {
            const prod = item.productId || item;
            const itemPrice = prod.price || 0;
            const discount = prod.discount || 0;
            const finalPrice = itemPrice - (itemPrice * discount / 100);
            return sum + (finalPrice * (item.quantity || 1));
        }, 0);

        let calculatedFee = 0;
        let isFree = false;
        let reason = "";

        if (maxDistance > 10) {
            calculatedFee = 60;
        } else {
            if (orderSubtotal < 200) {
                calculatedFee = 30;
            } else {
                calculatedFee = 0;
                isFree = true;
                reason = "Order above ₹200 (under 10km)";
            }
        }

        return {
            distance: Math.round(maxDistance * 10) / 10,
            deliveryFee: calculatedFee,
            isFreeEligible: isFree,
            freeReason: reason
        };
    } catch (err) {
        console.error("Delivery calculation error:", err);
        return { distance: 5, deliveryFee: 40, isFreeEligible: false, freeReason: "" };
    }
}

export async function calculateDeliveryFeeController(request, response) {
    try {
        const { addressId, list_items, delivery_type, is_subscription } = request.body;
        if (!list_items || !list_items.length) {
            return response.status(400).json({
                message: "Provide items list",
                error: true,
                success: false
            });
        }

        const result = await calculateDeliveryFeeInternal(
            addressId,
            list_items,
            delivery_type,
            is_subscription
        );

        return response.json({
            message: "Delivery fee calculated successfully",
            error: false,
            success: true,
            data: result
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function checkoutOrderController(request, response) {
    try {
        const userId = request.userId;
        const { 
            list_items, 
            totalAmt, 
            addressId, 
            subTotalAmt, 
            payment_method, 
            coupon_code, 
            wallet_discount,
            delivery_fee,
            delivery_type,
            delivery_slot,
            is_subscription,
            subscription_days
        } = request.body;

        if (!list_items || !list_items.length || (delivery_type !== 'pickup' && !addressId) || !payment_method) {
            return response.status(400).json({
                message: "Provide items, address, and payment method",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // Validate wallet balance if paying by wallet
        if (payment_method === 'WALLET') {
            const wallet = await WalletModel.findOne({ userId });
            if (!wallet || wallet.balance < totalAmt) {
                return response.status(400).json({
                    message: "Insufficient wallet balance",
                    error: true,
                    success: false
                });
            }

            // Deduct from wallet
            wallet.balance -= totalAmt;
            wallet.transactions.push({
                amount: totalAmt,
                type: 'debit',
                description: `Payment for Order ${makeId('ORD-', 8)}`
            });
            await wallet.save();

            // Sync user model balance
            user.wallet_balance = wallet.balance;
            await user.save();
        }

        // Calculate dynamic delivery fee safely on backend
        const deliveryResult = await calculateDeliveryFeeInternal(
            addressId,
            list_items,
            delivery_type,
            is_subscription
        );
        const backendDeliveryFee = deliveryResult.deliveryFee;

        // Generate delivery OTP: 4-digit numeric code
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const orderId = makeId('ORD-', 10);

        const orderItems = list_items.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            image: item.productId.image,
            price: item.productId.price,
            quantity: item.quantity,
            farmerId: item.productId.farmer_id
        }));

        const newOrder = new OrderModel({
            userId,
            orderId,
            items: orderItems,
            paymentId: payment_method === 'COD' ? "" : makeId('pay_', 12),
            payment_status: payment_method === 'COD' ? 'pending' : 'completed',
            payment_method,
            delivery_address: delivery_type === 'pickup' ? null : addressId,
            delivery_type: delivery_type || 'home_delivery',
            delivery_slot: delivery_type === 'pickup' ? null : delivery_slot,
            is_subscription: is_subscription || false,
            subscription_days: subscription_days || 0,
            subTotalAmt,
            delivery_fee: backendDeliveryFee,
            discount: subTotalAmt + backendDeliveryFee - totalAmt,
            totalAmt,
            status: 'placed',
            delivery_otp: deliveryOtp
        });

        // Create Razorpay order if payment_method is RAZORPAY
        let razorpayOrder = null;
        if (payment_method === 'RAZORPAY') {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(totalAmt * 100),
                    currency: "INR",
                    receipt: `receipt_${orderId.substring(0, 10)}`
                });
            } catch (err) {
                console.error("Razorpay order creation failed, using mock:", err);
                razorpayOrder = {
                    id: `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    amount: Math.round(totalAmt * 100),
                    currency: "INR"
                };
            }
        }

        await newOrder.save();

        // Clear cart
        await CartProductModel.deleteMany({ userId });
        await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });

        // Add to Order History list
        user.orderHistory.push(newOrder._id);
        await user.save();

        // Create notification for customer
        const notification = new NotificationModel({
            userId,
            title: "Order Placed Successfully",
            message: `Your DesiKit order ${orderId} has been placed. Share delivery verification OTP ${deliveryOtp} with your partner.`,
            type: 'order'
        });
        await notification.save();

        // Create notification for farmers
        const farmerIds = [...new Set(list_items.map(item => item.productId.farmer_id))].filter(Boolean);
        for (const fId of farmerIds) {
            const fNotification = new NotificationModel({
                userId: fId,
                title: "New Order Received",
                message: `You have received a new order ${orderId}. Please pack the items for courier pickup.`,
                type: 'order'
            });
            await fNotification.save();
        }

        // Create notification for all delivery partners
        const riders = await UserModel.find({ role: 'DELIVERY_PARTNER' });
        for (const rider of riders) {
            const rNotification = new NotificationModel({
                userId: rider._id,
                title: "New Delivery Job Available",
                message: `Order ${orderId} is ready in your region. Accept job now.`,
                type: 'order'
            });
            await rNotification.save();
        }

        // Dispatch transactional email confirmation with formal branding
        await sendEmail({
            sendTo: user.email,
            subject: `DesiKit – Order Placed Successfully #${orderId}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px 20px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #fafdfa;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #16a34a; margin: 0; font-size: 28px;">DesiKit</h1>
                    <p style="color: #15803d; font-size: 14px; margin: 4px 0 0 0; font-weight: bold;">From Farm to Family</p>
                </div>
                <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #e8ebd9;">
                    <h2 style="color: #16a34a; margin-top: 0; font-size: 20px; text-align: center;">Order Confirmed!</h2>
                    <p style="font-size: 15px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for your purchase! Your order <strong>#${orderId}</strong> has been successfully received by our farm networks and is being prepared for dispatch.</p>
                    
                    <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 14px;">
                        <p style="margin: 0 0 8px 0;"><strong>Delivery Slot:</strong> ${delivery_slot || 'Standard Dispatch (Within 24 Hours)'}</p>
                        <p style="margin: 0 0 8px 0;"><strong>Verification OTP (Share with rider):</strong> <strong style="color: #16a34a; font-size: 16px;">${deliveryOtp}</strong></p>
                        <p style="margin: 0;"><strong>Total Bill Amount:</strong> ₹${totalAmt}</p>
                    </div>

                    <p style="font-size: 13px; color: #64748b; line-height: 1.5;">You can track your order status in real-time on your dashboard. Please keep the verification OTP safe and share it with the delivery partner upon arrival.</p>
                </div>
                <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #64748b;">
                    <p style="margin: 0;">Support local farms. Supporting direct food ecosystems.</p>
                    <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} DesiKit App. All Rights Reserved.</p>
                </div>
            </div>
            `
        });

        return response.json({
            message: "Order placed successfully",
            error: false,
            success: true,
            data: newOrder,
            razorpayOrder,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123'
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getOrderItemsController(request, response) {
    try {
        const userId = request.userId;
        const list = await OrderModel.find({ userId })
            .populate('delivery_address')
            .sort({ createdAt: -1 });

        const hydratedList = [];
        for (const order of list) {
            const orderObj = order.toObject();
            if (orderObj.items && orderObj.items.length > 0) {
                const firstItem = orderObj.items[0];
                const farmerId = firstItem.farmerId;
                if (farmerId) {
                    const farmer = await FarmerModel.findOne({ user_id: farmerId });
                    if (farmer) {
                        orderObj.farm_address = farmer.farm_address;
                        orderObj.farm_name = farmer.farm_name;
                    }
                }
            }
            hydratedList.push(orderObj);
        }

        return response.json({
            message: "Orders list retrieved successfully",
            error: false,
            success: true,
            data: hydratedList
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function cancelOrderController(request, response) {
    try {
        const userId = request.userId;
        const { orderId } = request.body;

        const order = await OrderModel.findOne({ orderId, userId });
        if (!order) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        if (order.status !== 'placed' && order.status !== 'confirmed') {
            return response.status(400).json({
                message: "Cannot cancel order at this stage",
                error: true,
                success: false
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Refund wallet if paid online
        if (order.payment_method !== 'COD' && order.payment_status === 'completed') {
            let wallet = await WalletModel.findOne({ userId });
            if (!wallet) {
                wallet = new WalletModel({ userId, balance: 0, transactions: [] });
            }
            wallet.balance += order.totalAmt;
            wallet.transactions.push({
                amount: order.totalAmt,
                type: 'credit',
                description: `Refund for Cancelled Order ${orderId}`
            });
            await wallet.save();

            await UserModel.findByIdAndUpdate(userId, { wallet_balance: wallet.balance });
        }

        return response.json({
            message: "Order cancelled and refund credited if applicable",
            error: false,
            success: true,
            data: order
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
