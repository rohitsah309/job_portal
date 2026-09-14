import { toLowerCase } from "zod";
import JobAlert from "../models/jobAlert.model.js";
import Notification from "../models/notification.model.js";

export const createJobNotification = async (job) => {
    const alerts = await JobAlert.find({
        isActive: true
    });

    const notification = [];

    for (const alert of alerts) {
        let matches = true;

        if (alert.category) {
            if (
                !job.category ||
                job.category.toLowerCase() !==
                    alert.category.toLowerCase()
            ) {
                match = false
            }
        }

        if (matches && alert.state) {
            if (
                !job.state ||
                job.state.toLowerCase() !==
                    alert.category.toLowerCase()
            ) {
                matches = false;
            }
        }

        if(matches && alert.qualification) {
            const qualificationMatches = 
                job.qualification?.some(
                    (qualification) => 
                        qualification
                            .toLowerCase()
                            .includes(
                                alert.qualification.toLowerCase()
                            )
                );


                if (!qualificationMatches) {
                    matches = false;
                }
        }

        if (matches && alert.keywords) {
            const keyword = alert.keywords.toLowerCase();

            const keywordMatches = 
                job.title?.toLowerCase().includes(keyword) ||
                job.organization?.toLowerCase().includes(keyword);

            if (!keywordMatches) {
                matches = false;
            }

        }

        if(matches) {
            notification.push({
                user: alert.user,
                job: job._id,
                title: `New Job: ${job.title}`,
                message: `A new ${job.category || ""} job matching your alert is available`

            });
        }
    }

    if (notification,length > 0) {
        await Notification.insertMany(
            notification,
            {ordered: false}
        )
    }


}