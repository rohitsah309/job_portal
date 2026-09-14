import AppError from "../utils/AppError.js"

export const adminOnly = async (req, res, next) => {
    if(req.user.role !== "ADMIN") {
        throw new AppError(
            "Admin access required",
            403
        );
    }
    next()
};