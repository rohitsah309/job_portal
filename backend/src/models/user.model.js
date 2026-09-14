import mongoose from "mongoose";
import { email, lowercase, maxLength, minLength, string, trim } from "zod";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: string,
            required: true,
            trim: true,
            minLength: 2,
            maxLength: 50
        },

        email: {
            type: string,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        phone: {
            type: string,
            required: true,
            unique: true,
            trim: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"]
        },
        password: {
            type: string,
            required: true,
            minLength: 6,
            select: false
        },
        role: {
            type: string,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },
        savedJobs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job"
            }
        ]
    },

    {
        timestamps: true
    }

)

const User = mongoose.model("User", userSchema);

export default User;