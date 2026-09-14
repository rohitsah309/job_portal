import express from "express"
import { getJobs, getJob, createJob, deleteJob, updateJob } from "../controllers/job.controller.js"
import asyncHandler from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";
import { createJobSchema } from "../validators/job.validator.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    asyncHandler(getJobs)
);
router.get(
    "/:id",
    asyncHandler(getJob)
);


router.post(
    "/",
    protect,
    adminOnly,
    validate(createJobSchema),
    asyncHandler(createJob)
);
router.post(
    "/:id",
    protect,
    adminOnly,
    asyncHandler(deleteJob)
);

router.put(
    "/:id",
    protect,
    adminOnly,
    asyncHandler(updateJob)
);


export default router;