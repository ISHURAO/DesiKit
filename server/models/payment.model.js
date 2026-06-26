import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    payment_method: {
        type: String,
        enum: ['COD', 'STRIPE', 'RAZORPAY', 'WALLET'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const PaymentModel = mongoose.model('payment', paymentSchema);

export default PaymentModel;
