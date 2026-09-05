# Sourcing Refinement Loop

An AI-powered candidate sourcing application that converts natural-language hiring requirements into structured filters and a scoring rubric, searches a provided candidate dataset, ranks candidates using an LLM, and iteratively refines the search based on recruiter feedback.

## Overview

The application helps recruiters refine candidate searches through an interactive feedback loop:

1. Recruiter enters a natural-language hiring requirement.
2. Gemini converts the requirement into:
   - Objective filters
   - A subjective scoring rubric
3. Objective filters are applied locally against the provided candidate dataset.
4. Gemini ranks the matching candidates using the generated rubric.
5. Recruiter reviews the results and provides feedback.
6. Gemini refines the filters and rubric based on the feedback.
7. The candidates are filtered and ranked again.
8. Recruiter can freeze the final shortlist.

## Architecture

```text
Recruiter Requirement
        |
        v
   React Frontend
        |
        v
   Express Backend
        |
        v
   Gemini LLM
        |
        +----------------------+
        |                      |
        v                      v
Objective Filters       Subjective Rubric
        |                      |
        v                      |
Local Candidate Filtering      |
        |                      |
        +----------+-----------+
                   |
                   v
             Gemini Ranking
                   |
                   v
             Ranked Results
                   |
                   v
          Recruiter Feedback
                   |
                   v
           Gemini Refinement
                   |
                   v
             Search Again
                   |
                   v
             Final Shortlist
```
## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- CORS
- dotenv

### AI

- Google Gemini API
- `@google/genai`

### Data

- JSON candidate dataset containing 48 profiles

## Project Structure

```
flexiple-assignment/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   ├── llmService.js
│   ├── filterCandidates.js
│   ├── profiles.json
│   ├── package.json
│   
│
└── README.md
```
## Getting Started

# Prerequisites

Node.js installed
A Google Gemini API key
1. Clone the repository
git clone <your-github-repository-url>
cd flexiple-assignment
2. Install backend dependencies
cd server
npm install

Create a .env file inside the server directory:

GEMINI_API_KEY=your_api_key_here
3. Start the backend

From the server directory:

node server.js

The backend runs on:

http://localhost:5001
4. Install frontend dependencies

Open a new terminal:

cd client
npm install
5. Start the frontend
npm run dev

Open the local URL provided by Vite in your browser.

API Endpoints
Search
POST /api/search

Accepts a natural-language hiring requirement and returns:

Objective filters
Subjective scoring rubric
Ranked candidates

Example request:

{
  "requirement": "I need a backend engineer in Bangalore with 4-7 years of experience. They should have strong PostgreSQL and AWS RDS skills, preferably from a startup or scaleup."
}
Refine
POST /api/refine

Accepts:

Original requirement
Current filters
Current rubric
Recruiter feedback

The LLM uses the feedback to refine the search criteria and the candidates are filtered and ranked again.

## Key Design Decisions
Objective filtering is performed locally

The LLM interprets the recruiter's requirement and produces structured filters, but JavaScript performs the actual filtering against the candidate dataset.

This keeps mandatory filtering deterministic and avoids relying on the LLM to perform exact dataset filtering.

Preferences are represented through the scoring rubric

Not every recruiter preference should become a hard filter.

For example:

"Preferably from a startup or scaleup"

is treated as a ranking preference rather than a mandatory eligibility requirement.

This allows candidates who satisfy the mandatory requirements but come from other company types to remain eligible while still being ranked appropriately.

LLM is used for interpretation and ranking

Gemini is responsible for:

Understanding natural-language requirements
Generating objective filters
Generating the subjective rubric
Ranking candidates
Refining the search based on recruiter feedback

The candidate dataset itself remains local.

Error Handling

The application handles:

Empty search requirements
Empty recruiter feedback
No matching candidates
Loading states during searches
Loading states during refinement
LLM/API failures
Gemini quota/rate-limit errors
Invalid or unexpected LLM JSON responses

The UI displays recruiter-friendly error messages instead of exposing raw backend errors.

Refinement Example

Initial requirement:

Backend engineer in Bangalore with 4-7 years of experience,
strong PostgreSQL and AWS RDS skills, preferably from a startup or scaleup.

The recruiter may provide feedback such as:

Candidate 1 is too junior. Candidates 2 and 4 are a great fit.

The application sends the original requirement, current filters, current rubric, and feedback to Gemini.

Gemini then adjusts the search criteria/rubric while preserving requirements that were not changed.

The candidates are filtered and ranked again.

## Assumptions and Trade-offs
The provided 48-profile dataset is treated as the complete candidate pool.
Objective requirements are hard filters.
Preferences are handled through the scoring rubric.
Search state is maintained in the frontend and is not persisted to a database.
The final "Freeze Search" action prevents further refinement during the current session.
Candidate ranking is LLM-based, so ranking explanations and scores may vary between runs.
Future Improvements

## If this were extended into a production system, possible improvements would include:

Persistent recruiter/search history
Candidate profile pages
Authentication and role-based access
Database-backed candidate storage
Structured LLM outputs with stronger schema validation
Ranking explanations with criterion-level scores
Search analytics and recruiter feedback history
Background processing for larger candidate datasets
Production deployment and monitoring

