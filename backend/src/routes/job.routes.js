import express from "express"
import { getJobs, getJob, createJob, deleteJob, updateJob } from "../controllers/job.controller.js"
import asyncHandler from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { createJobSchema } from "../validators/job.validator.js";


const router = express.Router();

router.get("/", asyncHandler(getJobs));
router.get("/:id", asyncHandler(getJob));


router.post("/", validate(createJobSchema), asyncHandler(createJob));
router.post("/:id", asyncHandler(deleteJob));

router.put("/:id", asyncHandler(updateJob));


export default router;