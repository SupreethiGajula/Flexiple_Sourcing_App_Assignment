import { useState } from "react";
import "./App.css";

function App() {
  const [requirement, setRequirement] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!requirement.trim()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement: requirement,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim() || !results) {
      return;
    }

    setError("");
    setRefining(true);

    try {
      const response = await fetch("http://localhost:5001/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirement: requirement,
          currentFilters: results.filters,
          currentRubric: results.rubric,
          feedback: feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Refinement failed");
      }

      setResults(data);
      setFeedback("");
    } catch (error) {
      console.error("Refinement error:", error);
      setError(
        error.message || "Refinement failed. Please try again."
      );
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Sourcing Refinement Loop</h1>
        <p>AI-powered candidate sourcing and refinement</p>
      </header>

      <main className="container">

        {/* Search Section */}
        <section className="search-section">
          <h2>What candidate are you looking for?</h2>

          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="e.g. I need a backend engineer in Bangalore with 4-7 years of experience..."
            rows="4"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Candidates"}
          </button>
        </section>

        {/* Results Section */}
        <section className="results-section">
          <h2>Search Results</h2>

          {/* Error */}
          {error && (
            <p className="error-message">
              ⚠️ {error}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <p>Searching for candidates...</p>
          )}

          {/* No results yet */}
          {!loading && !results && (
            <p className="placeholder">
              Your matching candidates will appear here.
            </p>
          )}

          {/* Results */}
          {!loading && results && (
            <>
              {/* Objective Filters */}
              <h3>Objective Filters</h3>

              <p>
                <strong>Location:</strong>{" "}
                {results.filters.location.join(", ")}
              </p>

              <p>
                <strong>Experience:</strong>{" "}
                {results.filters.min_years_experience} -{" "}
                {results.filters.max_years_experience} years
              </p>

              <p>
                <strong>Skills:</strong>{" "}
                {results.filters.skills.join(", ")}
              </p>

              {/* Scoring Rubric */}
              <h3>Scoring Rubric</h3>

              {results.rubric.map((item, index) => (
                <p key={index}>
                  {item.criterion} — {item.weight * 100}%
                </p>
              ))}

              {/* Ranked Candidates */}
              <h3>Ranked Candidates</h3>

              {results.candidates.length === 0 ? (
                <p className="empty-message">
                  No candidates matched your requirements.
                  Try refining your search.
                </p>
              ) : (
                <div className="candidate-list">
                  {results.candidates.map((candidate) => (
                    <div
                      className="candidate-card"
                      key={candidate.candidate_id}
                    >
                      <div className="candidate-header">
                        <h4>{candidate.candidate_id}</h4>

                        <span className="score">
                          {candidate.score}/100
                        </span>
                      </div>

                      <p className="candidate-reason">
                        {candidate.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Refinement */}
              <div className="refinement-section">
                <h3>Refine Search</h3>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Candidate 1 is too junior. Candidates 2 and 4 are a great fit."
                  rows="3"
                  disabled={frozen}
                />

                <button
                  onClick={handleRefine}
                  disabled={!feedback.trim() || refining || frozen}
                >
                  {refining ? "Refining..." : "Refine Search"}
                </button>

                {/* Freeze Search */}
                <button
                  onClick={() => setFrozen(true)}
                  disabled={frozen}
                >
                  {frozen ? "Search Frozen" : "Freeze Search"}
                </button>

                {/* Frozen Message */}
                {frozen && (
                  <p className="frozen-message">
                    ✓ Search frozen. This shortlist is now final.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

