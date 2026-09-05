const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { parseRequirement, rankCandidates, refineRequirement } = require("./llmService");
const filterCandidates = require("./filterCandidates");
const candidates = require("./profiles.json");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Flexiple Sourcing API is running"
    });
});
app.post("/api/search", async (req, res) => {
    try {
        const { requirement } = req.body;

        if (!requirement) {
            return res.status(400).json({
                success: false,
                error: "Requirement is required"
            });
        }

        // 1. Ask Gemini to understand the requirement
        const parsedRequirement = await parseRequirement(requirement);

        // 2. Convert Gemini's response from JSON string to JavaScript object
        const filters = JSON.parse(parsedRequirement);

console.log("Requirement:", requirement);
console.log("Filters:", filters.objective_filters);

// 3. Filter candidates locally
const matchingCandidates = filterCandidates(
    candidates,
    filters.objective_filters
);

console.log("Matching candidates:", matchingCandidates.length);

        const rankedCandidatesText = await rankCandidates(
            matchingCandidates,
            filters.subjective_rubric
        );
        const cleanedRankedCandidates = rankedCandidatesText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

        const rankedCandidates = JSON.parse(rankedCandidatesText);

        // 4. Return the results
        res.json({
            success: true,
            filters: filters.objective_filters,
            rubric: filters.subjective_rubric,
            candidates: rankedCandidates
        });

    } catch (error) {
    console.error("Search error:", error);

    if (error.status === 429) {
        return res.status(429).json({
            success: false,
            error: "AI service quota exceeded. Please try again later."
        });
    }

    res.status(500).json({
        success: false,
        error: "Failed to process search. Please try again."
    });
}
});
app.post("/api/refine", async (req, res) => {
    try {
        const {
            requirement,
            currentFilters,
            currentRubric,
            feedback
        } = req.body;

        if (!requirement || !feedback) {
            return res.status(400).json({
                success: false,
                error: "Requirement and feedback are required"
            });
        }

        console.log("Sending feedback to Gemini...");

        const refinedRequirement = await refineRequirement(
            requirement,
            currentFilters,
            currentRubric,
            feedback
        );

        console.log("Refined response received:");
        console.log(refinedRequirement);

        const refinedFilters = JSON.parse(refinedRequirement);

        // Apply the refined filters locally
        const matchingCandidates = filterCandidates(
            candidates,
            refinedFilters.objective_filters
        );

        console.log(
            "Matching candidates after refinement:",
            matchingCandidates.length
        );

        // Rank the newly filtered candidates
        const rankedCandidatesText = await rankCandidates(
            matchingCandidates,
            refinedFilters.subjective_rubric
        );

        const cleanedRankedCandidates = rankedCandidatesText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const rankedCandidates = JSON.parse(cleanedRankedCandidates);
        res.json({
            success: true,
            filters: refinedFilters.objective_filters,
            rubric: refinedFilters.subjective_rubric,
            candidates: rankedCandidates
        });

  } catch (error) {
    console.error("Refinement error:", error);

    if (error.status === 429) {
        return res.status(429).json({
            success: false,
            error: "AI service quota exceeded. Please try again later."
        });
    }

    res.status(500).json({
        success: false,
        error: "Failed to refine search. Please try again."
    });
}
});
// app.get("/api/test-gemini", async (req, res) => {
//     try {
//         const result = await testGemini();

//         res.json({
//             success: true,
//             response: result
//         });
//     } catch (error) {
//         console.error("Gemini error:", error);

//         res.status(500).json({
//             success: false,
//             error: "Failed to communicate with Gemini"
//         });
//     }
// });

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`App is successfully running on port:${PORT}`);
});