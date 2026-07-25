/**
 * useCandidates Hook
 *
 * Central state management for the candidate dashboard.
 * Exclusively loads and manages candidate data from backend APIs.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculatePriorityScore, getPriorityLevel } from '../utils/calculatePriority';

function mapBackendCandidate(c) {
  return {
    id: c.id,
    name: c.name,
    email: c.email || `candidate${c.id}@example.com`,
    college: c.college,
    assignmentScore: Number(c.assignment_score ?? c.assignmentScore ?? 50),
    videoScore: Number(c.video_score ?? c.videoScore ?? 50),
    atsScore: Number(c.ats_score ?? c.atsScore ?? 50),
    githubScore: Number(c.github_score ?? c.githubScore ?? 50),
    communicationScore: Number(c.communication_score ?? c.communicationScore ?? 50),
    status: c.status || 'pending',
    assignmentEval: c.assignmentEval || {
      uiQuality: 7,
      componentStructure: 8,
      stateHandling: 7,
      edgeCaseHandling: 8,
      responsiveness: 8,
      accessibilityAwareness: 7,
    },
    videoEval: c.videoEval || {
      clarity: 8,
      confidence: 7,
      architectureExplanation: 8,
      tradeoffReasoning: 7,
      communicationStrength: 8,
    },
    videoNotes: c.videoNotes || [],
    appliedAt: c.created_at || c.appliedAt || new Date().toISOString(),
  };
}

export function useCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); 
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    assignmentMin: 0,
    assignmentMax: 100,
    videoMin: 0,
    videoMax: 100,
    atsMin: 0,
    atsMax: 100,
    status: 'all', 
  });
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);

  // Fetch summary metrics
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setApiSummary({
            total: json.data.total_candidates,
            reviewed: json.data.reviewed,
            shortlisted: json.data.shortlisted,
            pending: json.data.pending,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to refresh dashboard summary:', e);
    }
  }, []);

  // Fetch candidates and dashboard summary from backend API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [candRes, summaryRes] = await Promise.all([
          fetch('/api/candidates?limit=100'),
          fetch('/api/dashboard-summary'),
        ]);

        if (!candRes.ok || !summaryRes.ok) {
          throw new Error(`API Error: Candidates status ${candRes.status}, Summary status ${summaryRes.status}`);
        }

        const candJson = await candRes.json();
        const summaryJson = await summaryRes.json();

        if (isMounted) {
          if (candJson.success && Array.isArray(candJson.data)) {
            setCandidates(candJson.data.map(mapBackendCandidate));
          }
          if (summaryJson.success && summaryJson.data) {
            setApiSummary({
              total: summaryJson.data.total_candidates,
              reviewed: summaryJson.data.reviewed,
              shortlisted: summaryJson.data.shortlisted,
              pending: summaryJson.data.pending,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching backend candidate API:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Enrich candidates with computed priority data
  const enrichedCandidates = useMemo(() => {
    return candidates.map((c) => {
      const priorityScore = calculatePriorityScore(c);
      const priorityLevel = getPriorityLevel(priorityScore);
      return { ...c, priorityScore, priorityLevel };
    });
  }, [candidates]);

  // Apply search + filters + sorting
  const filteredCandidates = useMemo(() => {
    let result = enrichedCandidates;

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    // Filters
    result = result.filter(
      (c) =>
        c.assignmentScore >= filters.assignmentMin &&
        c.assignmentScore <= filters.assignmentMax &&
        c.videoScore >= filters.videoMin &&
        c.videoScore <= filters.videoMax &&
        c.atsScore >= filters.atsMin &&
        c.atsScore <= filters.atsMax &&
        (filters.status === 'all' || c.status === filters.status)
    );

    // Sorting
    result = [...result].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'priority') {
        aVal = a.priorityScore;
        bVal = b.priorityScore;
      } else {
        aVal = a.assignmentScore;
        bVal = b.assignmentScore;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [enrichedCandidates, searchQuery, filters, sortBy, sortOrder]);

  // Update a single candidate's data (optimistic state + backend persistence)
  const updateCandidate = useCallback(async (id, updates) => {
    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    // Backend API persistence
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverUpdated = mapBackendCandidate(json.data);
          setCandidates((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...serverUpdated } : c))
          );
          fetchSummary();
        }
      }
    } catch (err) {
      console.error(`Failed to persist update for candidate ${id} to API:`, err);
    }
  }, [fetchSummary]);

  // Toggle candidate in comparison list (max 3)
  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  // Get the selected candidate object
  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return enrichedCandidates.find((c) => c.id === selectedCandidateId) || null;
  }, [selectedCandidateId, enrichedCandidates]);

  // Get comparison candidates
  const compareCandidates = useMemo(() => {
    return enrichedCandidates.filter((c) => compareIds.includes(c.id));
  }, [compareIds, enrichedCandidates]);

  // Summary stats
  const summary = useMemo(() => {
    if (apiSummary) {
      return apiSummary;
    }
    const total = enrichedCandidates.length;
    const reviewed = enrichedCandidates.filter((c) => c.status === 'reviewed').length;
    const shortlisted = enrichedCandidates.filter((c) => c.status === 'shortlisted').length;
    const pending = enrichedCandidates.filter((c) => c.status === 'pending').length;
    return { total, reviewed, shortlisted, pending };
  }, [enrichedCandidates, apiSummary]);

  // Add a new candidate (POST /api/candidates)
  const addCandidate = useCallback(async (newCandidateData) => {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCandidateData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || json.message || 'Failed to create candidate');
    }

    const createdCandidate = mapBackendCandidate(json.data);
    setCandidates((prev) => [createdCandidate, ...prev]);
    fetchSummary();
    return createdCandidate;
  }, [fetchSummary]);

  return {
    candidates: filteredCandidates,
    allCandidates: enrichedCandidates,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
    selectedCandidate,
    selectedCandidateId,
    setSelectedCandidateId,
    updateCandidate,
    addCandidate,
    compareIds,
    toggleCompare,
    clearCompare,
    compareCandidates,
    summary,
  };
}
