import axios from "axios";
import { PDFParse } from "pdf-parse";
import crypto from "crypto";
import { ingestJobs } from "../services/jobIngestion.service.js";


const SSC_URL = "https://ssc.gov.in/";


const normalizeText = (value) => {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
};


// --------------------------------------------------
// Get SSC notice links
// --------------------------------------------------

const fetchSSCNotices = async () => {
    const response = await axios.get(
        "https://ssc.gov.in/api/general-website/portal/notice-boards",
        {
            params: {
                page: 1,
                limit: 50,
                contentType: "notice-boards",
                key: "createdAt",
                order: "DESC",
                isAttachment: true,
                language: "english",
                attributes:
                    "id,headline,examId,contentType,redirectUrl,startDate,endDate,language,createdAt"
            },
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
                Accept: "application/json"
            },
            timeout: 30000
        }
    );

    console.log("SSC API response received");

    const data = response.data;

    const records = Array.isArray(data?.data)
        ? data.data
        : [];

    console.log(
        "SSC notice records found:",
        records.length
    );

    const notices = [];

    for (const item of records) {

        const title = normalizeText(
            item.headline || ""
        );

        console.log("\nSSC Notice:");
        console.log("Title:", title);

        // Get PDF from attachments
        const attachment =
            Array.isArray(item.attachments)
                ? item.attachments.find(
                      (file) =>
                          file.type === "application/pdf" ||
                          file.fileName?.toLowerCase().endsWith(".pdf")
                  )
                : null;

        if (!attachment?.path) {
            console.log("No PDF attachment found");
            continue;
        }

        // SSC returns Windows-style backslashes
        const cleanPath =
            attachment.path
                .replace(/\\/g, "/")
                .replace(/^\/+/, "");

        const pdfUrl =
            `https://ssc.gov.in/api/attachment/${cleanPath}`;

        console.log("PDF:", pdfUrl);

        // Ignore result / answer key / admit card etc.
        if (!isRecruitmentNotice(title)) {
            console.log("Skipped: not a recruitment notice");
            continue;
        }

        notices.push({
            title,
            url: pdfUrl
        });

        console.log("Added recruitment notice");
    }

    // Remove duplicate URLs
    const uniqueNotices = Array.from(
        new Map(
            notices.map((notice) => [
                notice.url,
                notice
            ])
        ).values()
    );

    console.log(
        "\nSSC recruitment notices found:",
        uniqueNotices.length
    );

    return uniqueNotices;
};

// --------------------------------------------------
// Decide whether notice is recruitment-related
// --------------------------------------------------

const isRecruitmentNotice = (title) => {

    const text = title.toLowerCase();


    const includeKeywords = [
        "notice of",
        "recruitment",
        "examination",
        "selection post",
        "junior engineer",
        "combined graduate",
        "combined higher secondary",
        "sub-inspector",
        "stenographer",
        "multi-tasking",
        "constable"
    ];


    const excludeKeywords = [
        "result",
        "marks",
        "answer key",
        "admit card",
        "admission certificate",
        "option",
        "preference",
        "correction",
        "corrigendum",
        "schedule",
        "city of examination"
    ];


    const included =
        includeKeywords.some(
            (keyword) =>
                text.includes(keyword)
        );


    const excluded =
        excludeKeywords.some(
            (keyword) =>
                text.includes(keyword)
        );


    return included && !excluded;
};


// --------------------------------------------------
// Extract application dates from PDF
// --------------------------------------------------

const extractApplicationDates = (text) => {
    const cleanText = normalizeText(text);

    /*
     * Supported date formats:
     * 01/09/2026
     * 01-09-2026
     * 01.09.2026
     * 1/9/2026
     * 1 September 2026
     * 01 September 2026
     */

    const numericDate =
        "\\d{1,2}[./-]\\d{1,2}[./-]\\d{4}";

    const monthDate =
        "\\d{1,2}\\s+" +
        "(?:January|February|March|April|May|June|July|August|September|October|November|December)" +
        "\\s+\\d{4}";

    const datePattern =
        `(?:${numericDate}|${monthDate})`;

    const convertDate = (value) => {
        const cleanValue = value.trim();

        // Numeric date
        if (/^\d{1,2}[./-]\d{1,2}[./-]\d{4}$/.test(cleanValue)) {
            const parts = cleanValue.split(/[./-]/);

            const day = Number(parts[0]);
            const month = Number(parts[1]);
            const year = Number(parts[2]);

            const date = new Date(
                year,
                month - 1,
                day
            );

            return isNaN(date.getTime())
                ? null
                : date;
        }

        // "01 September 2026"
        const monthMatch = cleanValue.match(
            /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i
        );

        if (monthMatch) {
            const day = Number(monthMatch[1]);
            const monthName = monthMatch[2];
            const year = Number(monthMatch[3]);

            const monthNames = [
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "july",
                "august",
                "september",
                "october",
                "november",
                "december"
            ];

            const month = monthNames.indexOf(
                monthName.toLowerCase()
            );

            if (month === -1) {
                return null;
            }

            const date = new Date(
                year,
                month,
                day
            );

            return isNaN(date.getTime())
                ? null
                : date;
        }

        return null;
    };

    /*
     * --------------------------------------------------
     * Pattern 1:
     * Date to Date
     *
     * Example:
     * 01/09/2026 to 30/09/2026
     * --------------------------------------------------
     */

    const rangeRegex = new RegExp(
        `(${datePattern})\\s*(?:to|-|–|—)\\s*(${datePattern})`,
        "i"
    );

    let match = cleanText.match(rangeRegex);

    if (match) {
        const start = convertDate(match[1]);
        const end = convertDate(match[2]);

        if (start && end) {
            console.log(
                "Application dates found:",
                start,
                "to",
                end
            );

            return {
                applicationStart: start,
                applicationLastDate: end
            };
        }
    }

    /*
     * --------------------------------------------------
     * Pattern 2:
     * Application start/opening date + last/closing date
     * --------------------------------------------------
     */

    const startRegex = new RegExp(
        `(?:opening date|start date|application start|online application starts?|commencement of online application|date of commencement)[^\\d]{0,100}(${datePattern})`,
        "i"
    );

    const endRegex = new RegExp(
        `(?:closing date|last date|application last date|last date for submission|closing date for submission|online application closes?|closing of online application)[^\\d]{0,100}(${datePattern})`,
        "i"
    );

    const startMatch = cleanText.match(startRegex);
    const endMatch = cleanText.match(endRegex);

    if (startMatch && endMatch) {
        const start = convertDate(startMatch[1]);
        const end = convertDate(endMatch[1]);

        if (start && end) {
            console.log(
                "Application dates found:",
                start,
                "to",
                end
            );

            return {
                applicationStart: start,
                applicationLastDate: end
            };
        }
    }

    /*
     * --------------------------------------------------
     * Pattern 3:
     * Common SSC wording
     *
     * Example:
     * Dates for submission of Online Application:
     * 01.09.2026 to 30.09.2026
     * --------------------------------------------------
     */

    const applicationSectionRegex = new RegExp(
        `(?:dates?\\s+for\\s+(?:submission|filling)\\s+of\\s+online\\s+application|online\\s+application)[\\s\\S]{0,250}?(${datePattern})\\s*(?:to|-|–|—)\\s*(${datePattern})`,
        "i"
    );

    const applicationMatch =
        cleanText.match(applicationSectionRegex);

    if (applicationMatch) {
        const start = convertDate(applicationMatch[1]);
        const end = convertDate(applicationMatch[2]);

        if (start && end) {
            console.log(
                "Application dates found:",
                start,
                "to",
                end
            );

            return {
                applicationStart: start,
                applicationLastDate: end
            };
        }
    }

    /*
     * --------------------------------------------------
     * Pattern 4:
     * Last fallback:
     * Find all dates in the PDF and use the first two.
     *
     * We only use this if the above patterns fail.
     * --------------------------------------------------
     */



    console.log(
        "Application dates could not be extracted"
    );

    return {
        applicationStart: null,
        applicationLastDate: null
    };
};


// --------------------------------------------------
// Extract qualification
// --------------------------------------------------

const extractQualification = (text) => {

    const cleanText =
        text.toLowerCase();


    const qualifications = [];


    if (
        cleanText.includes("bachelor") ||
        cleanText.includes("graduation") ||
        cleanText.includes("graduate")
    ) {
        qualifications.push(
            "Graduate"
        );
    }


    if (
        cleanText.includes("12th") ||
        cleanText.includes("10+2") ||
        cleanText.includes("higher secondary")
    ) {
        qualifications.push(
            "12th"
        );
    }


    if (
        cleanText.includes("matriculation") ||
        cleanText.includes("10th")
    ) {
        qualifications.push(
            "10th"
        );
    }


    if (
        cleanText.includes("engineering") ||
        cleanText.includes("b.e.") ||
        cleanText.includes("b.tech")
    ) {
        qualifications.push(
            "Engineering"
        );
    }


    return [
        ...new Set(qualifications)
    ];
};


// --------------------------------------------------
// Calculate job status
// --------------------------------------------------

const getStatus = (
    applicationStart,
    applicationLastDate
) => {

    const now = new Date();


    if (now < applicationStart) {
        return "UPCOMING";
    }


    if (now > applicationLastDate) {
        return "CLOSED";
    }


    return "OPEN";
};


// --------------------------------------------------
// Convert SSC notice → Job
// --------------------------------------------------

const normalizeSSCNotice = (
    notice,
    pdfText
) => {

    const dates =
        extractApplicationDates(
            pdfText
        );


    if (
        !dates.applicationStart ||
        !dates.applicationLastDate
    ) {
        return null;
    }


    const qualification =
        extractQualification(
            pdfText
        );


    return {

        sourceId: `SSC-${crypto
            .createHash("sha256")
            .update(notice.url)
            .digest("hex")}`,

        title:
            notice.title,

        organization:
            "Staff Selection Commission",

        category:
            "Government",

        state:
            "All India",

        qualification:
            qualification.length > 0
                ? qualification
                : ["Not specified"],

        vacancies:
            0,

        ageLimit: {
            min: 0,
            max: null
        },

        applicationStart:
            dates.applicationStart,

        applicationLastDate:
            dates.applicationLastDate,

        notificationUrl:
            notice.url,

        applyUrl:
            "https://ssc.gov.in/",

        sourceUrl:
            notice.url,

        status:
            getStatus(
                dates.applicationStart,
                dates.applicationLastDate
            )
    };
};


// --------------------------------------------------
// Main SSC fetcher
// --------------------------------------------------

export const fetchSSCJobs = async () => {

    console.log(
        "Starting SSC job fetch..."
    );


    const notices =
        await fetchSSCNotices();


    console.log(
        `SSC recruitment notices found: ${notices.length}`
    );


    const jobs = [];


    for (const notice of notices) {

        try {

            console.log(
                `Processing SSC: ${notice.title}`
            );


            const response =
                await axios.get(
                    notice.url,
                    {
                        responseType:
                            "arraybuffer",

                        timeout: 60000
                    }
                );


            const parser = new PDFParse({
                data: response.data
            });

            const pdf = await parser.getText();

            await parser.destroy();


            const job =
                normalizeSSCNotice(
                    notice,
                    pdf.text
                );


            if (job) {
                jobs.push(job);
            } else {
                console.log(
                    `Skipping: application dates not found`
                );
            }


        } catch (error) {

            console.error(
                `Failed to process SSC notice: ${notice.title}`
            );

            console.error(
                error.message
            );
        }
    }


    const result =
        await ingestJobs(jobs);


    console.log(
        "SSC ingestion result:",
        result
    );


    return result;
};