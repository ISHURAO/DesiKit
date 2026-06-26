import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    farm_name: {
        type: String,
        required: [true, "Provide farm name"]
    },
    farm_address: {
        type: String,
        required: [true, "Provide farm address"]
    },
    verified: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    license_doc: {
        type: String,
        default: ""
    },
    earnings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const FarmerModel = mongoose.model("Farmer", farmerSchema);

export default FarmerModel;
