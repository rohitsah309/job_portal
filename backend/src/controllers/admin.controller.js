import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import AppError from "../utils/AppError.js";


export const getAllUser = async (req, res) => {
    const users = await User.find()
        .select("-password")
        .sort({createdAt: -1});

    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
};

export const getAdminDashboard = async (req, res) => {
    const [
        totalUsers,
        totalAdmin,
        totalJobs,
        openJobs,
        upcomingJobs,
        closedJobs
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({role: "ADMIN"}),
        Job.countDocuments(),
        Job.countDocuments({status: "OPEN"}),
        Job.countDocuments({status: "UPCOMING"}),
        Job.countDocuments({status: "CLOSED"})
    ]);

    res.status(200).json({
        success: true,
        dashbord: {
            user: {
                total: totalUsers,
                admin: totalAdmin,
                normalUser: totalUsers - totalAdmin
            },
            jobs: {
                total: totalJobs,
                open: openJobs,
                upcoming: upcomingJobs,
                closed: closedJobs
            }
        }
    });
}

export const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        throw new AppError ("User not found", 404);
    }

    res.status(200).json({
        success: true,
        user
    });
}

export const updateUserRole = async (req, res) => {
    const {role} = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {role},
        {
            new: true,
            runValidators: true
        }
    );

    if(!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    });
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    if(userId === req.user._id.toString()) {
        throw new AppError(
            "You cannot delete your own account",
            400
        );
    }

    const user = await User.findByIdAndDelete(userId);

    if(!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "User deleted Successfully"
    });
};

