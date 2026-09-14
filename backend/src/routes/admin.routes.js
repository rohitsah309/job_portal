import express from "express";
import { adminOnly } from "../middleware/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.middleware.js";
import { getAllUser,
    getAdminDashboard,
    getUserById,
    updateUserRole,
    deleteUser
} from "../controllers/admin.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateRoleSchema } from "../validators/user.validator.js";


const router = express.Router();

router.get(
    "/users",
    protect,
    adminOnly,
    asyncHandler(getAllUser)
);

router.get(
    "/dashboard",
    protect,
    adminOnly,
    asyncHandler(getAdminDashboard)
);

router.get(
    "/users/:id",
    protect,
    adminOnly,
    asyncHandler(getUserById)
);

router.put(
    "/users/:id/role",
    protect,
    adminOnly,
    validate(updateRoleSchema),
    asyncHandler(updateUserRole)
)

router.delete(
    "/users/:id",
    protect,
    adminOnly,
    asyncHandler(deleteUser)
);

export default router;