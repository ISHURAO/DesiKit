import NotificationModel from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const list = await NotificationModel.find({ userId }).sort({ createdAt: -1 });

        return res.json({
            message: "Notifications retrieved",
            error: false,
            success: true,
            data: list
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await NotificationModel.updateMany({ userId, read: false }, { read: true });

        return res.json({
            message: "Notifications marked as read",
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
