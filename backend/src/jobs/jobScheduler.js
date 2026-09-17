import cron from "node-cron";

import { fetchUPSCJobs } from "../job-fetchers/index.js";


export const startJobScheduler = () => {

    // Run every 6 hours
    cron.schedule("*/5 * * * *", async () => {

        console.log(
            "Automatic job fetch started..."
        );

        try {

            await fetchUPSCJobs();

            console.log(
                "Automatic job fetch completed."
            );

        } catch (error) {

            console.error(
                "Automatic job fetch failed:"
            );

            console.error(error.message);
        }
    });


    console.log(
        "Job scheduler started."
    );
};