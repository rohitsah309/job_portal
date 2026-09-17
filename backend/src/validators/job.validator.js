import { z } from "zod"

export const createJobSchema = z.object({
    sourceId: z.string().min(1),

    title: z
        .string()
        .min(3, "Job title must be at least 3 characters"),
    
    organization: z
        .string()
        .min(2, "Organization is required"),

    category: z
        .string()
        .min(2, "Category is required"),

    state: z
        .string()
        .min(2, "State is required")
        .default("All india"),
    qualification: z
        .array(z.string())
        .min(0, "At least one qualification is required"),

    vacancies: z
        .number()
        .int("vacancies must be a whole number")
        .min(0, "Vacancies cannot be negative"),

    ageLimit: z.object({
        min: z 
            .number()
            .min(0, "Minimum age cannot be negative"),

        max: z
            .number()
            .min(0, "Maximum age cannot be negative")
            .nullable()
    }),

    salary: z
        .string()
        .optional(),

    applicationStart: z
        .coerce
        .date(),

    applicationLastDate: z
        .coerce
        .date(),

    notificationUrl: z
        .url("Invalid notification URL"),

    applyUrl: z
        .url("Invalid apply URL"),

    sourceUrl: z
        .url("Invalid source URL"),

    status: z
        .enum(["UPCOMING", "OPEN", "CLOSED"])
        .optional()
});