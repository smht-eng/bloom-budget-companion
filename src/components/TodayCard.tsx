import { Card } from "./ui/Card";
import { formatBaht } from "../lib/format";
import { useStore } from "../store/useStore";
import type { DailyGuideResult } from "../lib/budget";

interface Props {
  guide: DailyGuideResult;
}

export function TodayCard({ guide }: Props) {
  const mode = useStore((s) => s.settings.dailyBudgetMode);
  const setMode = useStore((s) => s.setDailyBudgetMode);
  const over = guide.todayRemaining < 0;

  return (
    <Card tone="blush" className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Today's spending</p>
        <div
          className="flex text-[11px] rounded-full bg-white/70 p-0.5 ring-1 ring-black/[0.05]"
          role="tablist"
          aria-label="Daily budget mode"
        >
          {(["adaptive", "fixed"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
                mode === m ? "bg-white text-ink shadow-softer" : "text-ink-soft"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div>
          <p className="text-[11px] text-ink-soft">Spent</p>
          <p className="font-display text-xl font-bold text-ink mt-0.5">{formatBaht(guide.todaySpent)}</p>
        </div>
        <div className="border-x border-black/[0.06]">
          <p className="text-[11px] text-ink-soft">Today's guide</p>
          <p className="font-display text-xl font-bold text-ink mt-0.5">{formatBaht(guide.dailyGuide)}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-soft">Remaining</p>
          <p className={`font-display text-xl font-bold mt-0.5 ${over ? "text-coral" : "text-ink"}`}>
            {formatBaht(Math.abs(guide.todayRemaining))}
          </p>
        </div>
      </div>

      <p className="text-sm text-center mt-4 text-ink-soft leading-relaxed">
        {over
          ? "You're a little over today's guide — that's okay. Let's look at the rest of the month."
          : `🌿 ${formatBaht(guide.todayRemaining)} left from today's guide.`}
      </p>
    </Card>
  );
}
