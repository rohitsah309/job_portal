import express from "express";
import {
    fetchUPSCJobController,
    fetchSSCJobsController
} from "../controllers/jobFetcher.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
    "/upsc",
    protect,
    adminOnly,
    asyncHandler(fetchUPSCJobController)
);
router.post(
    "/ssc",
    protect,
    adminOnly,
    asyncHandler(fetchSSCJobsController)
);

export default router;