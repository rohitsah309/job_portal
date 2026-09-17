import { tr } from "zod/v4/locales";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt"



export const updateProfile = async (req, res) => {
    const {
        name,
        email,
        phone
    } = req.body;

    if (email && email !== req.user.email) {
        const existingEmail = await User.findOne({
            email,
            _id: { $ne: req.user._id }
        });

        if (existingEmail) {
            throw new AppError(
                "Email is already registered",
                409
            );
        }
    }

    if (phone && phone !== req.user.phone) {
        const existingPhone = await User.findOne({
            phone,
            _id: { $ne: req.user._id }
        });

        if (existingPhone) {
            throw new AppError(
                "Phone number is already registered",
                409
            );
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { phone })
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};


export const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role
        }
    });
};

export const changePassword = async (req, res) => {
    const {
        currentPassword,
        newPassword
    } = req.body;

    const user = await User
        .findById(req.user._id)
        .select("+password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new AppError(
            "Current password is incorrect",
            401
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
};

export const saveJob = async (req, res) => {
    const {jobId} = req.params;

    const job = await Job.findById(jobId);
    
    if (!job) {
        throw new AppError("Job not found", 404);
    }

    if (req.user.savedJobs.includes(jobId)) {
        throw new AppError("Job already saved", 409)
    }

    req.user.savedJobs.push(job._id);

    await req.user.save();

    res.status(200).json({
        success: true,
        message: "Job saved successfully"
    });
};

export const removeSavedJob = async (req, res) => {
    const { jobId} = req.params;

    const jobIndex = req.user.savedJobs.findIndex(
        id => id.toString() === jobId
    );

    if (jobIndex === -1) {
        throw new AppError(" Job is not saved", 404);
    }

    req.user.savedJobs.splice(jobIndex, 1);

    await req.user.save();

    res.status(200).json({
        success: true,
        message: "Job removed from saved jobs"
    });
}

export const getSavedJobs = async (req, res) => {
    const user = await User
        .findById(req.user._id)
        .populate("savedJobs");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        count: user.savedJobs.length,
        jobs: user.savedJobs
    });
};