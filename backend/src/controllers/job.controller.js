import Job from "../models/job.model.js";
import { getJobStatus } from "../utils/jobStatus.js";
import AppError from "../utils/AppError.js";

export const getJobs = async (req, res) => {
    const {
      search,
      category,
      qualification,
      state,
      status,
      page = 1,
      limit = 10,
      sort = "latest",
    } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          organation: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      query.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    if (qualification) {
      query.qualification = {
        $regex: qualification,
        $options: "i",
      };
    }

    if (state) {
      query.state = {
        $regex: `^${state}$`,
        $options: "i",
      };
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    let sortOption = {};

    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "deadline") {
      sortOption = { applicationLastDate: 1 };
    }

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query).sort(sortOption).skip(skip).limit(limitNumber),

      Job.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalJobs / limitNumber);
    res.status(200).json({
      success: true,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalJobs,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      jobs,
    });
};

export const getJob = async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new AppError("Job not found", 404);
    }
    res.status(200).json({
      success: true,
      job,
    });
};

export const createJob = async (req, res) => {

    const { applicationStart, applicationLastDate } = req.body;

    if (new Date(applicationLastDate) < new Date(applicationStart)) {
        throw new AppError(
            "Application last date cannot be before application start date",
            404
        );
    }

    const status = getJobStatus(applicationStart, applicationLastDate);
    const newJob = await Job.create({
      ...req.body,
      status,
    });
    res.status(201).json({
      success: true,
      message: "Job created Successfully",
      job: newJob,
    });
};

export const deleteJob = async (req, res) => {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      throw new AppError("Job not found", 400);
    }
    res.status(200).json({
      message: "Job deleted successfully",
    });
  
};

export const updateJob = async (req, res) => {

    const { applicationStart, applicationLastDate } = req.body;

    if (
      applicationStart &&
      applicationLastDate &&
      new Date(applicationLastDate) < new Date(applicationStart)
    ) {
      throw new AppError(
        "Application last date cannot be before application start date",
        400,
      );
    }

    const updateData = {
      ...req.body,
    };

    if (applicationStart || applicationLastDate) {
      const existingJob = await job.findById(req.params.id);
      if (!existingJob) {
        throw new AppError("Job not found", 404);
      }

      const startDate = applicationStart || existingJob.applicationStart;

      const lastDate = applicationLastDate || existingJob.applicationLastDate;

      updateData.status = getJobStatus(startDate, lastDate);
    }
    const updateJob = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updateJob) {
      throw new AppError("Job not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updateJob,
    });
};
