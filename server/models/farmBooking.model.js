import mongoose from 'mongoose';

const farmBookingSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visitDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    visitorCount: {
        type: Number,
        default: 1
    },
    bookingFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const FarmBookingModel = mongoose.model('FarmBooking', farmBookingSchema);
export default FarmBookingModel;
