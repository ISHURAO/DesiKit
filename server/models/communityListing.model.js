import mongoose from 'mongoose';

const communityListingSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        enum: ['Seeds', 'Fertilizers', 'Equipment', 'Animal Feed', 'Other'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Used - Like New', 'Used - Fair'],
        default: 'New'
    },
    image: {
        type: String,
        default: ""
    },
    contactPhone: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['active', 'sold'],
        default: 'active'
    }
}, {
    timestamps: true
});

const CommunityListingModel = mongoose.model('CommunityListing', communityListingSchema);
export default CommunityListingModel;
