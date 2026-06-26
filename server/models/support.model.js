import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, "Provide ticket subject"]
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open'
    },
    messages: [
        {
            sender_id: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

const SupportTicketModel = mongoose.model('supportTicket', supportTicketSchema);

export default SupportTicketModel;
