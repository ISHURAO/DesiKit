import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['credit', 'debit'],
                required: true
            },
            description: {
                type: String,
                default: ""
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

const WalletModel = mongoose.model('wallet', walletSchema);

export default WalletModel;
