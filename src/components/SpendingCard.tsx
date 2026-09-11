import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";
import { formatBaht } from "../lib/format";
import { spendingMood } from "../lib/budget";

interface Props {
  monthLabel: string;
  spent: number;
  limit: number;
}

const MOOD_COPY: Record<string, { text: string; color: string }> = {
  healthy: { text: "Looking good 🌸", color: "var(--color-sage-deep)" },
  close: { text: "Take it a little easy 🌿", color: "var(--color-butter-deep)" },
  over: { text: "Your spending is above plan — let's rebalance gently.", color: "var(--color-coral)" },
};

export function SpendingCard({ monthLabel, spent, limit }: Props) {
  const mood = spendingMood(spent, limit);
  const copy = MOOD_COPY[mood];
  const remaining = limit - spent;

  return (
    <Card tone="white">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{monthLabel} spending</p>
        <span className="text-2xl" aria-hidden>
          {mood === "over" ? "🌿" : "🌷"}
        </span>
      </div>

      <div className="flex items-end justify-between mt-1">
        <p className="font-display text-2xl font-bold text-ink">{formatBaht(spent)}</p>
        <p className="text-sm text-ink-soft">of {formatBaht(limit)}</p>
      </div>

      <div className="mt-3">
        <ProgressBar value={spent} max={limit} color={copy.color} label={`${monthLabel} spending progress`} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-sm font-medium" style={{ color: copy.color }}>
          {copy.text}
        </p>
        <p className="text-sm text-ink-soft">
          {remaining >= 0 ? `${formatBaht(remaining)} left` : `${formatBaht(Math.abs(remaining))} over`}
        </p>
      </div>
    </Card>
  );
}
