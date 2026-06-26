import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'wallet', 'general'],
        default: 'general'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const NotificationModel = mongoose.model('notification', notificationSchema);

export default NotificationModel;
