import mongoose from 'mongoose';

const milkCollectionSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    quantity: {
        type: Number, // In Liters
        required: true
    },
    fatPercentage: {
        type: Number,
        required: true
    },
    snfPercentage: {
        type: Number,
        default: 8.5
    },
    ratePerLitre: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const MilkCollectionModel = mongoose.model('MilkCollection', milkCollectionSchema);
export default MilkCollectionModel;
