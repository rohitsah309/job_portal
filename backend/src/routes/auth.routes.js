import express from "express"
import { loginSchema, registerSchema} from "../validators/auth.validator.js";
import { login, register, logout } from "../controllers/auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(register)
)

router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(login)
);

router.post(
    "/logout",
    logout
);

export default router;