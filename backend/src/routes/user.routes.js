import express from "express";
import { getMe,
    updateProfile,
    changePassword,
    saveJob,
    removeSavedJob,
    getSavedJobs
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { changePasswordSchema, updateProfileSchema } from "../validators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";
const router = express.Router();

router.get(
    "/me",
    protect,
    asyncHandler(getMe)
);

router.put(
    "/profile",
    protect,
    validate(updateProfileSchema),
    asyncHandler(updateProfile)
);

router.put(
    "/password",
    protect,
    validate(changePasswordSchema),
    asyncHandler(changePassword)
);

router.get(
    "/jobs/saved",
    protect,
    asyncHandler(getSavedJobs)
);

router.post(
    "/jobs/:jobId/save",
    protect,
    asyncHandler(saveJob)
);

router.delete(
    "/jobs/:jobId/save",
    protect,
    asyncHandler(removeSavedJob)
);

export default router;