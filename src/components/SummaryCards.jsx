/**
 * SummaryCards Component
 *
 * Displays dashboard overview statistics:
 * Total, Reviewed, Shortlisted, and Pending candidate counts.
 */
import { Users, CheckCircle, Star, Clock } from 'lucide-react';

const cards = [
  { key: 'total', label: 'Total Candidates', icon: Users, gradient: 'from-indigo-500 to-purple-600' },
  { key: 'reviewed', label: 'Reviewed', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' },
  { key: 'shortlisted', label: 'Shortlisted', icon: Star, gradient: 'from-amber-500 to-orange-600' },
  { key: 'pending', label: 'Pending', icon: Clock, gradient: 'from-rose-500 to-pink-600' },
];

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, gradient }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface-card p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
        >
          {/* Gradient glow */}
          <div
            className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition-all duration-300 group-hover:opacity-25`}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">{label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary">
                {summary[key]}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
