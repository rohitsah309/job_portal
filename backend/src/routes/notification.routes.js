import express from "express"
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";

import {protect} from "../middleware/auth.middleware.js"
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
    "/",
    protect,
    asyncHandler(getMyNotifications)
);

router.get(
    "/unread-count",
    protect,
    asyncHandler(getUnreadNotificationCount)
);

router.patch(
    "/:id/read",
    protect,
    asyncHandler(markNotificationAsRead)
);

router.patch(
    "/read-all",
    protect,
    asyncHandler(markAllNotificationsAsRead)
);

router.delete(
    "/:id",
    protect,
    asyncHandler(deleteNotification)
);

export default router;