const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function parseRequirement(requirement) {

    const prompt = `
You are an AI recruiting assistant.

Convert the recruiter's hiring requirement into structured objective
filters and a subjective scoring rubric.

Recruiter requirement:
"${requirement}"

Return ONLY valid JSON in exactly this format:

{
  "objective_filters": {
    "location": [],
    "min_years_experience": null,
    "max_years_experience": null,
    "skills": [],
    "company_types": []
  },
  "subjective_rubric": [
    {
      "criterion": "",
      "weight": 0
    }
  ]
}

Rules:
- Extract only objective requirements that are explicitly stated or clearly implied.
- Do not invent requirements.
- location should contain cities/locations.
- skills should contain required technical skills.
- company_types can contain only: startup, scaleup, enterprise, agency.
- If minimum or maximum experience is not specified, use null.
- Rubric weights must add up to 1.
- Return JSON only. No markdown.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
        responseMimeType: "application/json"
    }
    });

    return response.text;
}
async function rankCandidates(candidates, rubric) {

    const prompt = `
You are an AI recruiting assistant.

Rank the following candidates based on the recruiter's scoring rubric.

Scoring rubric:
${JSON.stringify(rubric, null, 2)}

Candidates:
${JSON.stringify(candidates, null, 2)}

For each candidate:
- Give a score from 0 to 100.
- Consider every rubric criterion.
- Give a concise explanation for the score.
- Rank candidates from best fit to lowest fit.

Return ONLY valid JSON in exactly this format:

[
  {
    "candidate_id": "p01",
    "score": 92,
    "reason": "Strong PostgreSQL and AWS RDS experience with relevant backend experience."
  }
]
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
        responseMimeType: "application/json"
    }
    });

    return response.text;
}
async function refineRequirement(
    requirement,
    currentFilters,
    currentRubric,
    feedback
) {
    const prompt = `
You are an AI recruiting assistant.

The recruiter originally entered this requirement:

"${requirement}"

Current objective filters:
${JSON.stringify(currentFilters, null, 2)}

Current subjective scoring rubric:
${JSON.stringify(currentRubric, null, 2)}

The recruiter has now provided this feedback:

"${feedback}"

Use the recruiter's feedback to refine the objective filters
and subjective rubric.

Important rules:
- Preserve requirements that the recruiter did not ask to change.
- Only change the search criteria when the feedback justifies it.
- Do not invent requirements.
- Objective filters are mandatory requirements.
- Subjective preferences should be represented in the rubric.
- Rubric weights must add up to 1.
- Return ONLY valid JSON.
- Do not include markdown.

Return exactly this format:

{
  "objective_filters": {
    "location": [],
    "min_years_experience": null,
    "max_years_experience": null,
    "skills": [],
    "company_types": []
  },
  "subjective_rubric": [
    {
      "criterion": "",
      "weight": 0
    }
  ]
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
        responseMimeType: "application/json"
    }
    });

    return response.text;
}
module.exports = {
    parseRequirement,rankCandidates,refineRequirement
};

// async function testGemini() {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents: "Say hello to the Flexiple sourcing application in one sentence."
//     });

//     return response.text;
// }

