function filterCandidates(candidates, filters) {
    return candidates.filter(candidate => {

        // Location filter
        if (
            filters.location?.length > 0 &&
            !filters.location.includes(candidate.location)
        ) {
            return false;
        }

        // Minimum experience
        if (
            filters.min_years_experience !== null &&
            candidate.years_experience < filters.min_years_experience
        ) {
            return false;
        }

        // Maximum experience
        if (
            filters.max_years_experience !== null &&
            candidate.years_experience > filters.max_years_experience
        ) {
            return false;
        }

        // Skills
        if (filters.skills?.length > 0) {
            const candidateSkills = candidate.skills.map(skill =>
                skill.toLowerCase()
            );

            const hasAllRequiredSkills = filters.skills.every(skill =>
                candidateSkills.includes(skill.toLowerCase())
            );

            if (!hasAllRequiredSkills) {
                return false;
            }
        }

        return true;
    });
}

module.exports = filterCandidates;