import axios from "axios";
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { ingestJobs } from "../services/jobIngestion.service.js";

const UPSC_RECRUITMENT_URL = 
    "https://www.upsc.gov.in/recruitment/recruitment-advertisement";


const fetchUpscAdvertisement = async () => {
    const response = await axios.get(
        UPSC_RECRUITMENT_URL,
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            },
            timeout: 30000
        }
    );

    const $ = cheerio.load(response.data);

    const advertisements = [];

    $("a").each((_, element) => {
        const title = $(element)
            .text()
            .replace(/\s+/g, " ")
            .trim();

        const href = $(element).attr("href");

        if (!title || !href) {
            return;
        }

        const url = new URL(
            href,
            UPSC_RECRUITMENT_URL
        ).href;

        console.log("LINK:", title, "=>", url);

        // Ignore navigation links
        if (
            url.includes("/recruitment/") &&
            !url.toLowerCase().includes(".pdf")
        ) {
            return;
        }

        // Accept PDF documents
        if (
            url.toLowerCase().includes(".pdf") ||
            href.toLowerCase().includes(".pdf")
        ) {
            advertisements.push({
                title,
                url
            });
        }
    });

    const uniqueAdvertisements = Array.from(
        new Map(
            advertisements.map(item => [
                item.url,
                item
            ])
        ).values()
    );

    console.log(
        `Actual PDF advertisements found: ${uniqueAdvertisements.length}`
    );

    return uniqueAdvertisements;
};


export const fetchUPSCJobs = async () => {
    console.log("Fetching UPSC recruitment page...");

    const advertisements = await fetchUpscAdvertisement();

    console.log(
        `Found ${advertisements.length} UPSC advertisements`
    );

    const jobsToIngest = [];

    for (const advertisement of advertisements) {

        console.log(
            `Processing: ${advertisement.title}`
        );

        const pdfResponse = await axios.get(
            advertisement.url,
            {
                responseType: "arraybuffer",
                timeout: 60000
            }
        );

        const parser = new PDFParse({
            data: pdfResponse.data
        });

        const pdfData = await parser.getText();

        console.log(
            `PDF downloaded: ${pdfData.total} pages`
        );

        await parser.destroy();

        // Parse vacancies
        const vacancies =
            parseUPSCVacancies(pdfData.text);

        console.log(
            `Found ${vacancies.length} vacancies`
        );

        // Extract application dates
        const dates =
            extractApplicationDates(pdfData.text);

        console.log("Application dates:", dates);

        // Create jobs in MongoDB
        for (const vacancy of vacancies) {
            try{
                const job = createJobFromUPSCVacancy(
                    vacancy,
                    advertisement,
                    dates
                );

                if (job) {
                    jobsToIngest.push(job);
                } else {
                    skippedJobs++;
                }
            } catch(error) {
                console.error(
                    `Failed to create job ${vacancy.vacancyNumber}:`,
                    error.message
                );
            }
        }
    }

    const ingestionResult = await ingestJobs(jobsToIngest);
    console.log(
        "UPSC ingestion result:",
        ingestionResult
    );


    return {
        advertisementsFound: advertisements.length,
        jobsFound: jobsToIngest.length,
        jobsCreated: ingestionResult.created,
        jobsSkipped: ingestionResult.skipped,
        jobsFailed: ingestionResult.failed
    };
};

const normalizeText = (value) => {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
};

const extractNumber = (text) => {
    const normalizedText = normalizeText(text);

    // Numeric values:
    // 4 vacancies
    // 60 vacancies
    // 2 posts
    const numericMatch = normalizedText.match(
        /\b(\d+)\s+vacanc(?:y|ies)\b/i
    );

    if (numericMatch) {
        return Number(numericMatch[1]);
    }

    const wordNumbers = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90
    };

    const wordMatch = normalizedText.match(
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+vacanc(?:y|ies)\b/i
    );

    if (wordMatch) {
        return wordNumbers[wordMatch[1].toLowerCase()];
    }

    return 0;
};

const extractQualification = (text) => {
    const match = text.match(
        /Essential Qualification[s]?\s*[:\-]?\s*(.*?)(?=\s+(?:Desirable Qualification[s]?|Desirable|Duties|Responsibilities|Age|Pay Scale|Salary|Experience)\b)/i
    );

    if (!match) {
        return [];
    }

    const qualificationText =
        normalizeText(match[1]);

    if (!qualificationText) {
        return [];
    }

    return [qualificationText];
};

const extractAgeLimit = (text) => {
    const ageMatches = [
        ...text.matchAll(
            /(?:age|age limit)[^.\n]{0,150}?(\d{1,2})\s*years?/gi
        )
    ];

    if (ageMatches.length === 0) {
        return {
            min: 0,
            max: null
        };
    }

    const ages = ageMatches
        .map((match) => Number(match[1]))
        .filter((age) => age > 0 && age <= 100);

    if (ages.length === 0) {
        return {
            min: 0,
            max: null
        };
    }

    return {
        min: 0,
        max: Math.max(...ages)
    };
};

const extractApplicationDates = (text) => {
    const cleanText = text
        .replace(/\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // Example:
    // ONLINE RECRUITMENT APPLICATIONS ... FROM 12-09-2026
    const startMatch = cleanText.match(
        /ONLINE\s+RECRUITMENT\s+APPLICATIONS.*?\bFROM\s+(\d{2}[-/]\d{2}[-/]\d{4})/i
    );

    // Example:
    // CLOSING DATE ... 1800 HRS ON 02-10-2026
    const lastDateMatch = cleanText.match(
        /CLOSING\s+DATE.*?\bON\s+(\d{2}[-/]\d{2}[-/]\d{4})/i
    );

    return {
        applicationStart: startMatch
            ? startMatch[1]
            : null,

        applicationLastDate: lastDateMatch
            ? lastDateMatch[1]
            : null
    };
};

const parseUPSCVacancies = (text) => {
    const cleanText = text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ");

    const vacancies = [];

    const vacancyRegex =
        /\(Vacancy No\.\s*([0-9]+)\)([\s\S]*?)(?=\(Vacancy No\.|\s*IMPORTANT|\s*GENERAL INSTRUCTIONS|\s*$)/gi;

    let match;

    while ((match = vacancyRegex.exec(cleanText)) !== null) {
        const vacancyNumber = match[1];

        const block = normalizeText(match[2]);

        if (!block) {
            continue;
        }

        console.log("\n=================================");
        console.log(`UPSC VACANCY: ${vacancyNumber}`);
        console.log("=================================");
        console.log("BLOCK:", block.substring(0, 500));

        // --------------------------------
        // TITLE
        // --------------------------------

        const titleMatch = block.match(
            /(?:post of|posts of|post\s*:\s*)(.*?)(?=\s+(?:in|under)\s+)/i
        );

        let title = titleMatch
            ? normalizeText(titleMatch[1])
            : "";

        // Remove unnecessary text from title
        title = title
            .replace(/\s+/g, " ")
            .trim();

        if (!title) {
            title = block.substring(0, 150);
        }

        // --------------------------------
        // ORGANIZATION
        // --------------------------------

        let organization =
            "Union Public Service Commission";

        const organizationMatch = block.match(
            /\b(?:in|under)\s+(.+?)(?=\s+(?:No\.?\s+of\s+Vacancies?|Number\s+of\s+Vacancies?|Essential\s+Qualification|Age|Pay\s+Scale)\b)/i
        );

        if (organizationMatch) {
            organization = normalizeText(
                organizationMatch[1]
            );
        }

        // Remove reservation information accidentally included
        organization = organization
            .split(/RESERVATION\s+POSITION/i)[0]
            .split(/IMPORTANT\s+NOTE/i)[0]
            .trim();

        // --------------------------------
        // VACANCIES
        // --------------------------------

        const vacanciesCount =
            extractNumber(block);

        console.log(
            "EXTRACTED TITLE:",
            title
        );

        console.log(
            "EXTRACTED ORGANIZATION:",
            organization
        );

        console.log(
            "EXTRACTED VACANCIES:",
            vacanciesCount
        );

        // --------------------------------
        // QUALIFICATION
        // --------------------------------

        const qualification =
            extractQualification(block);

        // --------------------------------
        // AGE
        // --------------------------------

        const ageLimit =
            extractAgeLimit(block);

        console.log(
            "EXTRACTED AGE:",
            ageLimit
        );

        // --------------------------------
        // SAVE PARSED VACANCY
        // --------------------------------

        vacancies.push({
            vacancyNumber,
            title,
            organization,
            vacancies: vacanciesCount,
            qualification,
            ageLimit,
            rawText: block
        });
    }

    console.log(
        `\nTotal UPSC vacancies parsed: ${vacancies.length}`
    );

    return vacancies;
};

const parseIndianDate = (dateString) => {
    if (!dateString) {
        return null;
    }

    const [day, month, year] =
        dateString.split(/[-/]/).map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
};


const createJobFromUPSCVacancy = (
    vacancy,
    advertisement,
    dates
) => {

    if (
        !dates.applicationStart ||
        !dates.applicationLastDate
    ) {
        return null;
    }


    const applicationStart =
        parseIndianDate(dates.applicationStart);

    const applicationLastDate =
        parseIndianDate(dates.applicationLastDate);


    const now = new Date();


    let status = "OPEN";


    if (now < applicationStart) {

        status = "UPCOMING";

    } else if (now > applicationLastDate) {

        status = "CLOSED";
    }


    return {
        sourceId:
            `UPSC-${vacancy.vacancyNumber}`,

        title:
            vacancy.title,

        organization:
            vacancy.organization,

        category:
            "Government",

        state:
            "All India",

        qualification:
            vacancy.qualification,

        vacancies:
            vacancy.vacancies,

        ageLimit:
            vacancy.ageLimit,

        applicationStart,

        applicationLastDate,

        notificationUrl:
            advertisement.url,

        applyUrl:
            "https://upsconline.nic.in/",

        sourceUrl:
            advertisement.url,

        status
    };
};