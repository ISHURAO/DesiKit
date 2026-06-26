import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    vehicle_details: {
        type: String,
        required: [true, "Provide vehicle details (e.g. Bike, Bicycle)"]
    },
    vehicle_number: {
        type: String,
        default: ""
    },
    verified: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    live_location: {
        lat: { type: Number, default: 28.6139 }, // Default to New Delhi or similar
        lng: { type: Number, default: 77.2090 }
    },
    earnings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const DeliveryPartnerModel = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

export default DeliveryPartnerModel;
