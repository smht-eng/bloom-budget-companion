import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}

export function RingProgress({
  progress,
  size = 176,
  strokeWidth = 14,
  color = "var(--color-coral)",
  trackColor = "rgba(0,0,0,0.06)",
  children,
}: Props) {
  const reducedMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
