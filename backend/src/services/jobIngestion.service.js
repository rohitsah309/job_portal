import Job from "../models/job.model.js";
import { createJobNotification } from "./notification.service.js";
import { createJobSchema } from "../validators/job.validator.js";


// Normalize job data
const normalizeJob = (job) => {
    return {
        sourceId: String(job.sourceId).trim(),

        title: String(job.title || "").trim(),

        organization: String(
            job.organization || ""
        ).trim(),

        category: String(
            job.category || "Government"
        ).trim(),

        state: String(
            job.state || "All India"
        ).trim(),

        qualification:
            Array.isArray(job.qualification)
                ? job.qualification
                : [],

        vacancies: Number(
            job.vacancies || 0
        ),

        ageLimit: {
            min: Number(
                job.ageLimit?.min || 0
            ),

            max:
                job.ageLimit?.max !== null &&
                job.ageLimit?.max !== undefined
                    ? Number(job.ageLimit.max)
                    : null
        },

        salary: job.salary || "",

        applicationStart:
            new Date(job.applicationStart),

        applicationLastDate:
            new Date(job.applicationLastDate),

        notificationUrl:
            job.notificationUrl || "",

        applyUrl:
            job.applyUrl || "",

        sourceUrl:
            job.sourceUrl || "",

        status:
            job.status
    };
};


// Ingest jobs
export const ingestJobs = async (jobs) => {

    const result = {
        total: jobs.length,
        created: 0,
        skipped: 0,
        failed: 0
    };


    for (const rawJob of jobs) {

        try {

            // -------------------------
            // 1. Normalize
            // -------------------------

            const jobData =
                normalizeJob(rawJob);


            // -------------------------
            // 2. Validate
            // -------------------------

            const validation =
                createJobSchema.safeParse(
                    jobData
                );


            if (!validation.success) {

                result.failed++;

                console.error(
                    "Job validation failed:",
                    validation.error.issues
                );

                continue;
            }


            const validJob =
                validation.data;


            // -------------------------
            // 3. Duplicate check
            // -------------------------

            const existingJob =
                await Job.findOne({
                    sourceId: validJob.sourceId
                });


            if (existingJob) {

                result.skipped++;

                console.log(
                    `Duplicate skipped: ${validJob.sourceId}`
                );

                continue;
            }


            // -------------------------
            // 4. Save job
            // -------------------------

            const job =
                await Job.create(
                    validJob
                );


            result.created++;

            console.log(
                `Job created: ${job.title}`
            );


            // -------------------------
            // 5. Notification
            // -------------------------

            try {

                await createJobNotification(
                    job
                );

            } catch (notificationError) {

                console.error(
                    "Notification creation failed:",
                    notificationError.message
                );
            }


        } catch (error) {

            result.failed++;

            console.error(
                "Job ingestion failed:",
                error.message
            );
        }
    }


    return result;
};