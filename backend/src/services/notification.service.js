import JobAlert from "../models/jobAlert.model.js";
import Notification from "../models/notification.model.js";


const normalizeText = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
};

const containsText = (text, search) => {
    return normalizeText(text).includes(normalizeText(search));
};

export const createJobNotification = async (job) => {
    const alerts = await JobAlert.find({
        isActive: true
    });

    const notification = [];

    for (const alert of alerts) {
        let matches = true;

        if (alert.category) {
            if (!containsText(job.category, alert.category)) {
                matches = false
            }
        }

        if (matches && alert.state) {
            if (
                !containsText(job.state, alert.state)
            ) {
                matches = false;
            }
        }

        if(matches && alert.qualification) {
            const qualificationMatches = 
                job.qualification?.some(
                    (qualification) => 
                        containsText(
                            qualification,
                            alert.qualification
                        )
                );


                if (!qualificationMatches) {
                    matches = false;
                }
        }

        if (matches && alert.keywords) {
            const keyword = normalizeText(alert.keywords);

            const searchableaText = [
            job.title,
            job.category,
            job.organization,
            job.state,
            ...JobAlert(job.qualification || [])
           ]
                .map(normalizeText)
                .join(" ");

           if (!searchableaText.includes(keyword)) {
            matches = false
           }

        }

        if(matches) {
            notification.push({
                user: alert.user,
                job: job._id,
                title: `New Job: ${job.title}`,
                message: `A new ${job.category || ""} job matching your alert is available`,

                isRead: false
            });
        }
    }

    if (notification.length === 0) {
        return;
    }

    try {
        await Notification.insertMany(
            notification,
            {
                ordered: false
            }
        );
    } catch(error) {
        if (error.code !== 11000) {
            throw error;
        }
    }

};