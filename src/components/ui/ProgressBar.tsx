import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  trackClassName?: string;
  heightClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  color = "var(--color-coral)",
  trackClassName = "bg-black/[0.06]",
  heightClassName = "h-3",
  label,
}: ProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      className={`w-full ${heightClassName} ${trackClassName} rounded-full overflow-hidden`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 18 }}
      />
    </div>
  );
}

interface AllocationBarProps {
  segments: { label: string; value: number; color: string }[];
}

export function AllocationBar({ segments }: AllocationBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="flex w-full h-4 rounded-full overflow-hidden ring-1 ring-black/[0.04]">
      {segments.map((s) => (
        <div
          key={s.label}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          title={`${s.label}: ${Math.round((s.value / total) * 100)}%`}
        />
      ))}
    </div>
  );
}
