import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function ComparisonModal({ candidates, onClose }) {
  const [compareData, setCompareData] = useState(null);

  useEffect(() => {
    if (!candidates || candidates.length < 2) return;
    const ids = candidates.map((c) => c.id).join(',');
    let isMounted = true;

    async function fetchCompare() {
      try {
        const res = await fetch(`/api/compare?ids=${ids}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setCompareData(json.data.comparison);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch backend comparison stats:', e);
      }
    }

    fetchCompare();
    return () => { isMounted = false; };
  }, [candidates]);

  if (!candidates || candidates.length === 0) return null;

  const getWinner = (key) => {
    let max = -1;
    let winners = [];
    candidates.forEach((c) => {
      const val = key === 'priorityScore' ? c.priorityScore : c[key];
      if (val > max) {
        max = val;
        winners = [c.id];
      } else if (val === max) {
        winners.push(c.id);
      }
    });
    return winners;
  };

  const assignmentWinners = getWinner('assignmentScore');
  const videoWinners = getWinner('videoScore');
  const atsWinners = getWinner('atsScore');
  const priorityWinners = getWinner('priorityScore');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-full w-full max-w-5xl flex-col rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Candidate Comparison</h2>
            <p className="text-sm text-text-muted">
              Comparing {candidates.length} candidates
              {compareData && (
                <span className="ml-2 text-xs font-semibold text-emerald-400">
                  (Max Priority Score: {compareData.priority_score?.max})
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-light hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${candidates.length}, minmax(0, 1fr))` }}>
            {candidates.map((c) => (
              <div key={c.id} className="flex flex-col gap-6 rounded-xl border border-border bg-surface-card p-6 relative">
                {/* Highlight highest priority */}
                {priorityWinners.includes(c.id) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20">
                    Top Priority
                  </div>
                )}
                
                {/* Profile */}
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <h3 className="font-bold text-text-primary">{c.name}</h3>
                  <p className="text-xs text-text-muted">{c.college}</p>
                  <div className="mt-3 flex justify-center">
                    <PriorityBadge level={c.priorityLevel} score={c.priorityScore} />
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Scores comparison */}
                <div className="space-y-4">
                  <ComparisonRow label="Assignment" value={c.assignmentScore} isWinner={assignmentWinners.includes(c.id)} />
                  <ComparisonRow label="Video" value={c.videoScore} isWinner={videoWinners.includes(c.id)} />
                  <ComparisonRow label="ATS" value={c.atsScore} isWinner={atsWinners.includes(c.id)} />
                  <ComparisonRow label="GitHub" value={c.githubScore} />
                  <ComparisonRow label="Comm." value={c.communicationScore} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, value, isWinner }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${isWinner ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-light text-text-primary border border-border/50'}`}>
        {value}
      </span>
    </div>
  );
}
