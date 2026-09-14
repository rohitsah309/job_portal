import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export const protect = async (req, res, next) => {
    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new AppError("User not found", 401);
        }

        req.user = user;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError("Invalid or expired token", 401);
    }
};