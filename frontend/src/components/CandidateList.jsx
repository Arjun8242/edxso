import { GitCompareArrows, Eye, UserSearch } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  shortlisted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export default function CandidateList({
  candidates,
  onSelect,
  compareIds,
  onToggleCompare,
}) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-card py-20 text-center">
        <UserSearch className="mb-4 h-16 w-16 text-text-muted opacity-40" />
        <p className="text-lg font-semibold text-text-secondary">No candidates found</p>
        <p className="mt-1 text-sm text-text-muted">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-light/50">
              <th className="px-4 py-3 font-semibold text-text-secondary">Compare</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Candidate</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">College</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">Assignment</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">Video</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">ATS</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">GitHub</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">Comm.</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Priority</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {candidates.map((candidate) => {
              const isComparing = compareIds.includes(candidate.id);
              return (
                <tr
                  key={candidate.id}
                  className={`transition-colors hover:bg-surface-light/40 ${
                    isComparing ? 'bg-accent/5' : ''
                  }`}
                >

                  <td className="px-4 py-3 text-center">
                    <button
                      id={`compare-btn-${candidate.id}`}
                      onClick={() => onToggleCompare(candidate.id)}
                      disabled={!isComparing && compareIds.length >= 3}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                        isComparing
                          ? 'border-accent bg-accent/20 text-accent'
                          : compareIds.length >= 3
                          ? 'cursor-not-allowed border-border/40 text-text-muted/40'
                          : 'border-border text-text-muted hover:border-accent/50 hover:text-accent'
                      }`}
                      title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                        {candidate.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{candidate.name}</p>
                        <p className="text-xs text-text-muted">{candidate.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-text-secondary text-xs max-w-[150px] truncate">
                    {candidate.college}
                  </td>

                  <ScoreCell value={candidate.assignmentScore} />
                  <ScoreCell value={candidate.videoScore} />
                  <ScoreCell value={candidate.atsScore} />
                  <ScoreCell value={candidate.githubScore} />
                  <ScoreCell value={candidate.communicationScore} />

                  <td className="px-4 py-3">
                    <PriorityBadge
                      level={candidate.priorityLevel}
                      score={candidate.priorityScore}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        statusStyles[candidate.status]
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      id={`view-detail-btn-${candidate.id}`}
                      onClick={() => onSelect(candidate.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-accent/50 hover:text-accent"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreCell({ value }) {
  const hue = (value / 100) * 120;
  return (
    <td className="px-4 py-3 text-center">
      <span
        className="inline-block min-w-[2.5rem] rounded-md px-2 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: `hsla(${hue}, 70%, 50%, 0.12)`,
          color: `hsl(${hue}, 70%, 55%)`,
        }}
      >
        {value}
      </span>
    </td>
  );
}
