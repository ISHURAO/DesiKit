import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'product',
                required: true
            },
            name: String,
            image: Array,
            price: Number,
            quantity: Number,
            farmerId: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        }
    ],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['COD', 'STRIPE', 'RAZORPAY', 'WALLET'],
        default: 'COD'
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address',
        default: null
    },
    delivery_type: {
        type: String,
        enum: ['home_delivery', 'pickup'],
        default: 'home_delivery'
    },
    delivery_slot: {
        type: String,
        enum: ['morning', 'evening', null],
        default: null
    },
    is_subscription: {
        type: Boolean,
        default: false
    },
    subscription_days: {
        type: Number,
        default: 0
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    delivery_fee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'placed'
    },
    delivery_partner_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    delivery_otp: {
        type: String,
        default: ""
    },
    invoice_receipt: {
        type: String,
        default: ""
    },
    rider_latitude: {
        type: Number,
        default: null
    },
    rider_longitude: {
        type: Number,
        default: null
    },
}, {
    timestamps: true
});

// Optimize database indexes for heavy order queries at scale
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ delivery_partner_id: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 }, { unique: true });

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;