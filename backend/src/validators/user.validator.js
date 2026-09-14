import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .trim()
        .optional(),

    email: z
        .string()
        .email("Please enter a valid email")
        .trim()
        .toLowerCase()
        .optional(),

    phone: z
        .string()
        .regex(
            /^[6-9]\d{9}$/,
            "Please enter a valid 10-digit phone number"
        )
        .optional()
});

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters")
});

export const updateRoleSchema = z.object({
    role: z.enum(["USER", "ADMIN"])
})