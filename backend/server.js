import app from "./src/app.js";
import { startJobScheduler } from "./src/jobs/jobScheduler.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)

    startJobScheduler();
});