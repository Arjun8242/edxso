/**
 * Header Component
 *
 * Top bar with logo/title.
 */
import { LayoutDashboard, UserPlus } from 'lucide-react';

export default function Header({ onOpenAddModal }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">
              Candidate Review Dashboard
            </h1>
            <p className="text-xs text-text-muted">Recruiter Evaluation Panel</p>
          </div>
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-light shadow-lg shadow-accent/20 hover:scale-[1.02]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Candidate</span>
          </button>
        )}
      </div>
    </header>
  );
}
