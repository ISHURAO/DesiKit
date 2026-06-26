import mongoose from 'mongoose';

const b2bContractSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    gstin: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        negotiatedPrice: {
            type: Number,
            required: true
        },
        monthlyVolume: {
            type: Number,
            required: true
        }
    }],
    deliverySchedule: {
        type: String,
        enum: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'],
        default: 'Daily'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

const B2BContractModel = mongoose.model('B2BContract', b2bContractSchema);

export default B2BContractModel;
