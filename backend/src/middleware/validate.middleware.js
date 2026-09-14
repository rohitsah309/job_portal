import { success } from "zod";

export const validate = (Schema) => {
    return (req, res, next) => {
        const result = Schema.safeParse(req.body);

        if(!result.success) {
            const messages = result.error.issues.map(
                (issue) => issue.message
            );
            
            return res.status(400).json({
                success: false,
                message: messages.join(", ")
            });
        }
        req.body = result.data;

        next()
    }
}