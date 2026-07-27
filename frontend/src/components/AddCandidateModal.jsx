import { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export default function AddCandidateModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    assignment_score: 80,
    video_score: 80,
    ats_score: 80,
    github_score: 80,
    communication_score: 80,
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field.endsWith('_score') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.college.trim()) {
      setError('Name and college are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAdd(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-full w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Add Candidate</h2>
              <p className="text-xs text-text-muted">Create a new candidate in database</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-light hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya Roy"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">College / Institute</label>
            <input
              type="text"
              required
              placeholder="e.g. IIT Bombay"
              value={formData.college}
              onChange={(e) => handleChange('college', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Assignment Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.assignment_score}
                onChange={(e) => handleChange('assignment_score', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Video Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.video_score}
                onChange={(e) => handleChange('video_score', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">ATS Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.ats_score}
                onChange={(e) => handleChange('ats_score', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-light px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">GitHub Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.github_score}
                onChange={(e) => handleChange('github_score', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-light px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Comm. Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.communication_score}
                onChange={(e) => handleChange('communication_score', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-light px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
