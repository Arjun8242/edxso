import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleRangeChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const resetFilters = () => {
    setFilters({
      assignmentMin: 0,
      assignmentMax: 100,
      videoMin: 0,
      videoMax: 100,
      atsMin: 0,
      atsMax: 100,
      status: 'all',
    });
    setSearchQuery('');
  };

  const hasActiveFilters =
    filters.assignmentMin > 0 ||
    filters.assignmentMax < 100 ||
    filters.videoMin > 0 ||
    filters.videoMax < 100 ||
    filters.atsMin > 0 ||
    filters.atsMax < 100 ||
    filters.status !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-3">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            id="search-candidates"
            type="text"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-light py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <button
          id="toggle-filters-btn"
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
            showFilters
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border bg-surface-light text-text-secondary hover:border-accent/40 hover:text-text-primary'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {showFilters ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-text-muted" />
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-border bg-surface-light px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          >
            <option value="priority">Priority Score</option>
            <option value="assignment">Assignment Score</option>
          </select>
          <button
            id="sort-order-btn"
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="rounded-xl border border-border bg-surface-light px-3 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
          >
            {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-border bg-surface-card p-5 animate-in fade-in duration-200">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Score Filters</h3>
            {hasActiveFilters && (
              <button
                id="reset-filters-btn"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-p3/10 px-2.5 py-1 text-xs font-medium text-p3 transition-colors hover:bg-p3/20"
              >
                <X className="h-3 w-3" />
                Reset All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <RangeFilter
              label="Assignment Score"
              min={filters.assignmentMin}
              max={filters.assignmentMax}
              onMinChange={(v) => handleRangeChange('assignmentMin', v)}
              onMaxChange={(v) => handleRangeChange('assignmentMax', v)}
            />

            <RangeFilter
              label="Video Score"
              min={filters.videoMin}
              max={filters.videoMax}
              onMinChange={(v) => handleRangeChange('videoMin', v)}
              onMaxChange={(v) => handleRangeChange('videoMax', v)}
            />

            <RangeFilter
              label="ATS Score"
              min={filters.atsMin}
              max={filters.atsMax}
              onMinChange={(v) => handleRangeChange('atsMin', v)}
              onMaxChange={(v) => handleRangeChange('atsMax', v)}
            />

            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">
                Review Status
              </label>
              <select
                id="status-filter-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RangeFilter({ label, min, max, onMinChange, onMaxChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-secondary">{label}</label>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full"
        />
        <input
          type="range"
          min={0}
          max={100}
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
