import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minLength: 2,
            maxLength: 50
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"]
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
            select: false
        },
        role: {
            type: String,
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