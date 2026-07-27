export function calculatePriority({ assignment_score, video_score, ats_score, github_score, communication_score }) {
  const score =
    assignment_score * 0.30 +
    video_score * 0.25 +
    ats_score * 0.20 +
    github_score * 0.15 +
    communication_score * 0.10;

  const rounded = Math.round(score * 100) / 100;

  let bucket = "P3";
  if (rounded >= 85) bucket = "P0";
  else if (rounded >= 70) bucket = "P1";
  else if (rounded >= 50) bucket = "P2";

  return { score: rounded, bucket };
}
