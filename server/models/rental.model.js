import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    equipmentName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    hourlyPrice: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ""
    },
    bookings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bookingDate: {
            type: String, // YYYY-MM-DD
            required: true
        },
        startHour: {
            type: Number, // 0 - 23
            required: true
        },
        endHour: {
            type: Number, // 0 - 23
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
});

const RentalModel = mongoose.model('Rental', rentalSchema);
export default RentalModel;
