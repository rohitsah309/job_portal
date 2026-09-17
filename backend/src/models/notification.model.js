import mongoose from "mongoose";
import { string } from "zod";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        title: {
            type: string,
            required: true,
            trim: true
        },
        message: {
            type: string,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index(
    {user: 1, job: 1 },
    {unique: true}
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;