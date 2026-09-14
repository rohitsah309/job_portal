import { email, z } from "zod"

export const registerSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(50)
        .trim(),

    email: z
        .string()
        .email("Please enter a valid email")
        .trim()
        .toLowerCase(),

    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),

    password: z
        .string()
        .min(6),

})

export const loginSchema = z.object({
    email: z
        .string()
        .email()
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(1, "Password is required")
})