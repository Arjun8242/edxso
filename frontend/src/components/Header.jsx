/**
 * Header Component
 *
 * Top bar with logo/title.
 */
import { LayoutDashboard } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-6 py-4">
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
    </header>
  );
}
