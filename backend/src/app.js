import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import jobRoutes from "./routes/job.routes.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js"
import jobAlertRoutes from "./routes/jobAlert.routes.js";
import connectDB from "./db/db.js"
import { errorMiddleware } from "./middleware/error.middleware.js"

const app = express()
dotenv.config()
connectDB()

app.use(cors())
app.use(express.json())
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        message: "Job portal Api is working"
    })
});

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user/alerts", jobAlertRoutes);


app.use(errorMiddleware);

export default app;
