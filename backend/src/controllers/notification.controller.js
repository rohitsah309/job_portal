
import Notification from "../models/notification.model.js";
import AppError from "../utils/AppError.js";

export const getMyNotifications = async (req, res) => {
    const notification = await Notification.find({
        user: req.user._id
    })
    .populate("job", "title organization category state")
    .sort({ createdAt: -1});

    const unreadCount = notification.filter(
        (notification) => !notification.isRead
    ).length;

    res.status(200).json({
        success: true,
        count: notification.length,
        unreadCount,
        notification
    });
};


export const markNotificationAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: req.params.id, //notification_id
            user: req.user._id  //User_id
        },
        {
            isRead: true
        },
        {
            new: true
        }
    );

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification
    });
};

export const markAllNotificationsAsRead = async (req, res) => {
    await Notification.updateMany(
        {
            user: req.user._id,
            isRead: false
        },
        {
            isRead: true
        }
    );

    res.status(200).json({
        success: true,
        message: "All notification marked as read"
    });
};

export const deleteNotification = async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Notification deleted successfully"
    });
};

export const getUnreadNotificationCount = async (req, res) => {
    const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        isRead: false
    });

    res.status(200).json({
        success: true,
        unreadCount
    });
};