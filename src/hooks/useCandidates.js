/**
 * useCandidates Hook
 *
 * Central state management for the candidate dashboard.
 * Handles: mock data, filtering, sorting, selection, score updates,
 * and comparison mode.
 */
import { useState, useMemo, useCallback } from 'react';
import { generateMockCandidates } from '../utils/mockData';
import { calculatePriorityScore, getPriorityLevel } from '../utils/calculatePriority';

const initialCandidates = generateMockCandidates(100);

export function useCandidates() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'assignment'
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    assignmentMin: 0,
    assignmentMax: 100,
    videoMin: 0,
    videoMax: 100,
    atsMin: 0,
    atsMax: 100,
    status: 'all', // 'all' | 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  });
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [compareIds, setCompareIds] = useState([]);

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

  // Update a single candidate's data (for score editing)
  const updateCandidate = useCallback((id, updates) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  // Toggle candidate in comparison list (max 3)
  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) return prev; // max 3
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
    const total = enrichedCandidates.length;
    const reviewed = enrichedCandidates.filter((c) => c.status === 'reviewed').length;
    const shortlisted = enrichedCandidates.filter((c) => c.status === 'shortlisted').length;
    const pending = enrichedCandidates.filter((c) => c.status === 'pending').length;
    return { total, reviewed, shortlisted, pending };
  }, [enrichedCandidates]);

  return {
    candidates: filteredCandidates,
    allCandidates: enrichedCandidates,
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
    compareIds,
    toggleCompare,
    clearCompare,
    compareCandidates,
    summary,
  };
}
