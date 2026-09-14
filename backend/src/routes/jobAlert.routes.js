import express from "express"

import {
    createJobAlert, 
    getMyJobAlerts,
    updateJobAlert,
    deleteJobAlert
} from "../controllers/jobAlert.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    createJobAlertSchema,
    updateJobAlertSchema
} from "../validators/jobAlert.validator.js"

const router = express.Router();

router.post(
    "/",
    protect,
    validate(createJobAlertSchema),
    asyncHandler(createJobAlert)
);

router.get(
    "/",
    protect,
    asyncHandler(getMyJobAlerts)
);

router.put(
    "/:id",
    protect,
    validate(updateJobAlertSchema),
    asyncHandler(updateJobAlert)
);


router.delete(
    "/:id",
    protect,
    asyncHandler(deleteJobAlert)
);

export default router;