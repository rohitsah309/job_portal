import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            trim: true
        },

        qualification: {
            type: String,
            trim: true
        },

        state: {
            type: String,
            trim: true
        },

        keywords: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const JobAlert = mongoose.model("JobAlert", jobAlertSchema);

export default JobAlert;