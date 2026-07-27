const WEIGHTS = {
  assignment: 0.3,
  video: 0.25,
  ats: 0.2,
  github: 0.15,
  communication: 0.1,
};

export function calculatePriorityScore(candidate) {
  return (
    (candidate.assignmentScore ?? 0) * WEIGHTS.assignment +
    (candidate.videoScore ?? 0) * WEIGHTS.video +
    (candidate.atsScore ?? 0) * WEIGHTS.ats +
    (candidate.githubScore ?? 0) * WEIGHTS.github +
    (candidate.communicationScore ?? 0) * WEIGHTS.communication
  );
}

export function getPriorityLevel(score) {
  if (score >= 85) return 'P0';
  if (score >= 70) return 'P1';
  if (score >= 50) return 'P2';
  return 'P3';
}

export function getPriorityColor(level) {
  switch (level) {
    case 'P0':
      return { bg: '#10b981', text: '#064e3b', label: 'P0 – Excellent' };
    case 'P1':
      return { bg: '#f59e0b', text: '#78350f', label: 'P1 – Good' };
    case 'P2':
      return { bg: '#f97316', text: '#7c2d12', label: 'P2 – Average' };
    case 'P3':
      return { bg: '#ef4444', text: '#7f1d1d', label: 'P3 – Low' };
    default:
      return { bg: '#6b7280', text: '#1f2937', label: 'Unknown' };
  }
}
