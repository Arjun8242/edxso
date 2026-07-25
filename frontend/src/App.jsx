import { useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import FilterBar from './components/FilterBar';
import CandidateList from './components/CandidateList';
import CandidateSidebar from './components/CandidateSidebar';
import ComparisonModal from './components/ComparisonModal';
import AddCandidateModal from './components/AddCandidateModal';
import { useCandidates } from './hooks/useCandidates';
import { GitCompareArrows, XCircle } from 'lucide-react';

export default function App() {
  const {
    candidates,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters,
    setFilters,
    selectedCandidate,
    setSelectedCandidateId,
    updateCandidate,
    addCandidate,
    compareIds,
    toggleCompare,
    clearCompare,
    compareCandidates,
    summary,
  } = useCandidates();

  const [showComparison, setShowComparison] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Header onOpenAddModal={() => setShowAddModal(true)} />
      
      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 space-y-8">
        <SummaryCards summary={summary} />
        
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-text-primary">Candidate Roster</h2>
            
            {/* Compare Action Bar */}
            {compareIds.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2 animate-in fade-in zoom-in-95">
                <span className="text-sm font-medium text-accent">
                  {compareIds.length} selected
                </span>
                <div className="h-4 w-px bg-accent/20" />
                <button
                  onClick={() => setShowComparison(true)}
                  disabled={compareIds.length < 2}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompareArrows className="h-4 w-4" />
                  Compare
                </button>
                <button
                  onClick={clearCompare}
                  className="rounded-lg p-1.5 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          
          <CandidateList
            candidates={candidates}
            onSelect={setSelectedCandidateId}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
        </div>
      </main>

      {/* Detail Sidebar */}
      <CandidateSidebar
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidateId(null)}
        onUpdate={updateCandidate}
      />

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          candidates={compareCandidates}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addCandidate}
      />
    </div>
  );
}
