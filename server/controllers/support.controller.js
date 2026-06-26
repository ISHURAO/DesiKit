import SupportTicketModel from "../models/support.model.js";

export const createTicket = async (req, res) => {
    try {
        const userId = req.userId;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                message: "Provide subject and initial message",
                error: true,
                success: false
            });
        }

        const ticket = new SupportTicketModel({
            userId,
            subject,
            messages: [{
                sender_id: userId,
                text: message
            }]
        });
        await ticket.save();

        return res.json({
            message: "Support ticket created successfully",
            error: false,
            success: true,
            data: ticket
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const addMessageToTicket = async (req, res) => {
    try {
        const sender_id = req.userId;
        const { ticketId, text } = req.body;

        if (!ticketId || !text) {
            return res.status(400).json({
                message: "Provide ticket ID and message text",
                error: true,
                success: false
            });
        }

        const ticket = await SupportTicketModel.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                error: true,
                success: false
            });
        }

        ticket.messages.push({
            sender_id,
            text
        });
        // If ticket was resolved, reopen it when a message is added
        if (ticket.status === 'resolved') {
            ticket.status = 'in_progress';
        }
        await ticket.save();

        return res.json({
            message: "Message sent successfully",
            error: false,
            success: true,
            data: ticket
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getMyTickets = async (req, res) => {
    try {
        const userId = req.userId;
        const tickets = await SupportTicketModel.find({ userId }).sort({ updatedAt: -1 });

        return res.json({
            message: "User tickets retrieved",
            error: false,
            success: true,
            data: tickets
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicketModel.find().populate('userId', 'name email role').sort({ updatedAt: -1 });

        return res.json({
            message: "All support tickets retrieved",
            error: false,
            success: true,
            data: tickets
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const resolveTicket = async (req, res) => {
    try {
        const { ticketId } = req.body;

        const ticket = await SupportTicketModel.findByIdAndUpdate(ticketId, { status: 'resolved' }, { new: true });
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Ticket marked as resolved",
            error: false,
            success: true,
            data: ticket
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
