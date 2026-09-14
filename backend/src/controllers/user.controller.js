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