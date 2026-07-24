
import { getPriorityColor } from '../utils/calculatePriority';

export default function PriorityBadge({ level, score }) {
  const color = getPriorityColor(level);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide"
      style={{ backgroundColor: `${color.bg}20`, color: color.bg, border: `1px solid ${color.bg}40` }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color.bg }}
      />
      {level}
      {score !== undefined && (
        <span className="ml-0.5 opacity-75">({Math.round(score)})</span>
      )}
    </span>
  );
}
