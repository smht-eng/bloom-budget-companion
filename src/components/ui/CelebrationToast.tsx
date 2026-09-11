import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { fireConfetti } from "../../lib/confetti";

const LEVEL_STYLE: Record<string, { bg: string; border: string; duration: number }> = {
  small: { bg: "bg-white/95", border: "ring-sage-deep/40", duration: 3200 },
  medium: { bg: "bg-blush/90", border: "ring-blush-deep/50", duration: 4200 },
  big: { bg: "bg-lavender/90", border: "ring-lavender-deep/50", duration: 5200 },
};

export function CelebrationToast() {
  const celebration = useStore((s) => s.celebration);
  const dismiss = useStore((s) => s.dismissCelebration);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!celebration) return;
    if (celebration.level === "big" && !reducedMotion) {
      fireConfetti();
    }
    const style = LEVEL_STYLE[celebration.level] ?? LEVEL_STYLE.small;
    const t = setTimeout(dismiss, style.duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration?.id]);

  const style = celebration ? LEVEL_STYLE[celebration.level] ?? LEVEL_STYLE.small : LEVEL_STYLE.small;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 sm:top-6 z-50 flex justify-center px-4"
      aria-live="polite"
    >
      <AnimatePresence>
        {celebration && (
          <motion.div
            key={celebration.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.92 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`pointer-events-auto max-w-sm w-full ${style.bg} ${style.border} ring-1 rounded-cozy-sm shadow-lift px-5 py-4 text-center`}
            role="status"
          >
            <p className="font-display font-semibold text-ink">{celebration.message}</p>
            {celebration.detail && <p className="text-sm text-ink-soft mt-1">{celebration.detail}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
