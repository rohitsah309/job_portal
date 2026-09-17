
import JobAlert from "../models/jobAlert.model.js";
import AppError from "../utils/AppError.js";

export const createJobAlert = async (req, res) => {
    const alert = await JobAlert.create({
        user: req.user._id,
        ...req.body
    });

    res.status(201).json({
        success: true,
        message: "Job alert created successfully",
        alert
    });
};


export const getMyJobAlerts = async (req, res) => {
    const alerts = await JobAlert.find({
        user: req.user._id
    }).sort({createdAt: -1});

    res.status(200).json({
        success: true,
        count: alerts.length,
        alerts
    });
};

export const updateJobAlert= async (req, res) => {
    const alert = await JobAlert.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user._id
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!alert) {
        throw new AppError("Job alert not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Job alert updated successfully",
        alert
    });
};

export const deleteJobAlert = async (req, res) => {
    const alert = await JobAlert.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if(!alert) {
        throw new AppError("Job alert not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Job alert deleted successfully"
    });
}