import { 
    fetchUPSCJobs,
    fetchSSCJobs
} from "../job-fetchers/index.js";

export const fetchUPSCJobController = async (req, res) => {
    const result = await fetchUPSCJobs();

    res.status(200).json({
        success: true,
        message: "UPSC job fetched successfully",
        result
    });   
};

export const fetchSSCJobsController = async (
    req,
    res
) => {

    const result =
        await fetchSSCJobs();


    res.status(200).json({
        success: true,
        message: "SSC jobs fetched successfully",
        result
    });
};