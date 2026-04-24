import { useState } from 'react';
import { X, GraduationCap, Code2, Video, FileCheck2, GitBranch, MessageSquare, Plus, Trash2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function CandidateSidebar({ candidate, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  if (!candidate) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignment', label: 'Assignment Eval' },
    { id: 'video', label: 'Video Eval' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              {candidate.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{candidate.name}</h2>
              <p className="text-xs text-text-muted">{candidate.college}</p>
            </div>
          </div>
          <button id="close-sidebar-btn" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-6 pt-2">
          {tabs.map((tab) => (
            <button key={tab.id} id={`sidebar-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-accent bg-accent/5 text-accent' : 'text-text-muted hover:text-text-secondary'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab candidate={candidate} onUpdate={onUpdate} />}
          {activeTab === 'assignment' && <AssignmentEvalTab candidate={candidate} onUpdate={onUpdate} />}
          {activeTab === 'video' && <VideoEvalTab candidate={candidate} onUpdate={onUpdate} />}
        </div>
      </div>
    </>
  );
}

function OverviewTab({ candidate, onUpdate }) {
  const scoreItems = [
    { key: 'assignmentScore', label: 'Assignment', icon: FileCheck2, color: '#6366f1' },
    { key: 'videoScore', label: 'Video', icon: Video, color: '#8b5cf6' },
    { key: 'atsScore', label: 'ATS', icon: Code2, color: '#06b6d4' },
    { key: 'githubScore', label: 'GitHub', icon: GitBranch, color: '#f59e0b' },
    { key: 'communicationScore', label: 'Communication', icon: MessageSquare, color: '#10b981' },
  ];
  const handleScoreChange = (key, value) => onUpdate(candidate.id, { [key]: Number(value) });
  const handleStatusChange = (value) => onUpdate(candidate.id, { status: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light p-4">
        <div>
          <p className="text-xs font-medium text-text-muted">Priority Level</p>
          <p className="mt-1 text-2xl font-bold text-text-primary">{Math.round(candidate.priorityScore)}</p>
        </div>
        <PriorityBadge level={candidate.priorityLevel} score={candidate.priorityScore} />
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-text-secondary">Review Status</label>
        <select id="sidebar-status-select" value={candidate.status} onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent">
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <GraduationCap className="h-4 w-4 text-text-muted" />{candidate.college}
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Scores</h3>
        {scoreItems.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-xl border border-border bg-surface-light p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon className="h-4 w-4" style={{ color }} /><span className="text-sm font-medium text-text-primary">{label}</span></div>
              <span className="rounded-md px-2 py-0.5 text-sm font-bold" style={{ color, backgroundColor: `${color}15` }}>{candidate[key]}</span>
            </div>
            <input type="range" id={`score-slider-${key}`} min={0} max={100} value={candidate[key]} onChange={(e) => handleScoreChange(key, e.target.value)} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentEvalTab({ candidate, onUpdate }) {
  const criteria = [
    { key: 'uiQuality', label: 'UI Quality' },
    { key: 'componentStructure', label: 'Component Structure' },
    { key: 'stateHandling', label: 'State Handling' },
    { key: 'edgeCaseHandling', label: 'Edge-case Handling' },
    { key: 'responsiveness', label: 'Responsiveness' },
    { key: 'accessibilityAwareness', label: 'Accessibility Awareness' },
  ];
  const handleChange = (key, value) => onUpdate(candidate.id, { assignmentEval: { ...candidate.assignmentEval, [key]: Number(value) } });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Assignment Evaluation</h3>
      <p className="text-xs text-text-muted">Rate each aspect from 1 (poor) to 10 (excellent).</p>
      {criteria.map(({ key, label }) => (
        <div key={key} className="rounded-xl border border-border bg-surface-light p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{label}</span>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-sm font-bold text-accent">{candidate.assignmentEval[key]}</span>
          </div>
          <input type="range" id={`assignment-eval-${key}`} min={1} max={10} value={candidate.assignmentEval[key]} onChange={(e) => handleChange(key, e.target.value)} className="w-full" />
          <div className="mt-1 flex justify-between text-[10px] text-text-muted"><span>1 – Poor</span><span>10 – Excellent</span></div>
        </div>
      ))}
    </div>
  );
}

function VideoEvalTab({ candidate, onUpdate }) {
  const criteria = [
    { key: 'clarity', label: 'Clarity' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'architectureExplanation', label: 'Architecture Explanation' },
    { key: 'tradeoffReasoning', label: 'Tradeoff Reasoning' },
    { key: 'communicationStrength', label: 'Communication Strength' },
  ];
  const [noteTimestamp, setNoteTimestamp] = useState('');
  const [noteText, setNoteText] = useState('');
  const handleChange = (key, value) => onUpdate(candidate.id, { videoEval: { ...candidate.videoEval, [key]: Number(value) } });

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNotes = [...(candidate.videoNotes || []), { timestamp: noteTimestamp || '0:00', text: noteText, id: Date.now() }];
    onUpdate(candidate.id, { videoNotes: newNotes });
    setNoteTimestamp('');
    setNoteText('');
  };
  const removeNote = (noteId) => {
    onUpdate(candidate.id, { videoNotes: (candidate.videoNotes || []).filter((n) => n.id !== noteId) });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Video Evaluation</h3>
      <p className="text-xs text-text-muted">Rate each aspect from 1 (poor) to 10 (excellent).</p>
      {criteria.map(({ key, label }) => (
        <div key={key} className="rounded-xl border border-border bg-surface-light p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{label}</span>
            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-sm font-bold text-purple-400">{candidate.videoEval[key]}</span>
          </div>
          <input type="range" id={`video-eval-${key}`} min={1} max={10} value={candidate.videoEval[key]} onChange={(e) => handleChange(key, e.target.value)} className="w-full" />
          <div className="mt-1 flex justify-between text-[10px] text-text-muted"><span>1 – Poor</span><span>10 – Excellent</span></div>
        </div>
      ))}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-text-primary">Timestamp Notes</h4>
        <div className="flex gap-2">
          <input type="text" id="note-timestamp-input" placeholder="e.g. 2:30" value={noteTimestamp} onChange={(e) => setNoteTimestamp(e.target.value)}
            className="w-20 rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
          <input type="text" id="note-text-input" placeholder="Add a note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()}
            className="flex-1 rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
          <button id="add-note-btn" onClick={addNote} className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {(candidate.videoNotes || []).length > 0 && (
          <div className="space-y-2">
            {candidate.videoNotes.map((note) => (
              <div key={note.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface-light p-3">
                <span className="shrink-0 rounded bg-purple-500/15 px-2 py-0.5 text-xs font-bold text-purple-400">{note.timestamp}</span>
                <p className="flex-1 text-sm text-text-secondary">{note.text}</p>
                <button onClick={() => removeNote(note.id)} className="shrink-0 text-text-muted transition-colors hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
