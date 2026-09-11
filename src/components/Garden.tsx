import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface Stage {
  emoji: string;
  label: string;
  threshold: number;
}

const STAGES: Stage[] = [
  { emoji: "🌰", label: "Ready to plant", threshold: 0 },
  { emoji: "🌱", label: "Seed", threshold: 1 },
  { emoji: "🌿", label: "Sprout", threshold: 3 },
  { emoji: "🌷", label: "Flower", threshold: 7 },
  { emoji: "🌸", label: "Bigger flower", threshold: 14 },
  { emoji: "🌳", label: "Tree", threshold: 30 },
];

export function gardenStageFor(streakDays: number): Stage {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (streakDays >= s.threshold) stage = s;
  }
  return stage;
}

interface GardenProps {
  streakDays: number;
}

export function Garden({ streakDays }: GardenProps) {
  const reducedMotion = useReducedMotion();
  const stage = gardenStageFor(streakDays);
  const nextStage = STAGES.find((s) => s.threshold > streakDays);

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="absolute inset-0 flex items-center justify-center opacity-50" aria-hidden>
        {!reducedMotion && (
          <>
            <motion.span
              className="absolute text-xl"
              style={{ left: "18%", top: "10%" }}
              animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute text-lg"
              style={{ right: "16%", top: "18%" }}
              animate={{ y: [0, -5, 0], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              🌟
            </motion.span>
            <motion.span
              className="absolute text-lg"
              style={{ left: "24%", bottom: "6%" }}
              animate={{ y: [0, -4, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            >
              🍃
            </motion.span>
          </>
        )}
      </div>

      <motion.div
        className="text-7xl sm:text-8xl select-none"
        animate={reducedMotion ? {} : { y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        {stage.emoji}
      </motion.div>

      <p className="font-display font-semibold text-ink mt-3">{stage.label}</p>
      <p className="text-sm text-ink-soft text-center mt-1">
        {streakDays > 0 ? (
          <>
            🔥 {streakDays} day streak
            {nextStage && <> · {nextStage.threshold - streakDays} more to {nextStage.label.toLowerCase()}</>}
          </>
        ) : (
          "Every streak starts again somewhere 🌱"
        )}
      </p>
    </div>
  );
}
