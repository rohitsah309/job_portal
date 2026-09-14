export const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid job ID";
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;

        const messages = Object.values(err.errors)
            .map(error => error.message);

        message = messages.join(", ");
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};