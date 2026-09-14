import { z } from "zod"
import { da } from "zod/v4/locales"

export const createJobAlertSchema = z
    .object({
        category: z.string().trim().optional(),
        qualification: z.string().trim().optional(),
        state: z.string().trim().optional(),
        keywords: z.string().trim().optional(),
        isActie: z.boolean().optional()
    })
    .refine(
        (data) => 
            data.category ||
            data.qualification ||
            data.state ||
            data.keywords,
        {
            message: "At least one alert condition is required"
        }
    );



export const updateJobAlertSchema = z.object({
    category: z.string().trim().optional(),
    qualification: z.string().trim().optional(),
    state: z.string().trim().optional(),
    keywords: z.string().trim().optional(),
    isActive: z.boolean().optional()   
});