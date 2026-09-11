import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { RingProgress } from "../components/ui/RingProgress";
import { Garden } from "../components/Garden";
import { computeBudgetBreakdown, computeSavingsProgress, expensesForMonth, sumExpenses } from "../lib/budget";
import { monthLabel, monthShort, toMonthKey } from "../lib/date";
import { formatBaht, formatPercent } from "../lib/format";

export function Goals() {
  const settings = useStore((s) => s.settings);
  const expenses = useStore((s) => s.expenses);
  const streaks = useStore((s) => s.streaks);
  const monthlyRecords = useStore((s) => s.monthlyRecords);
  const setSavingsGoalTarget = useStore((s) => s.setSavingsGoalTarget);

  const today = useMemo(() => new Date(), []);
  const monthKey = toMonthKey(today);
  const breakdown = useMemo(() => computeBudgetBreakdown(settings), [settings]);
  const monthFlexibleSpent = useMemo(() => sumExpenses(expensesForMonth(expenses, monthKey)), [expenses, monthKey]);
  const savings = useMemo(
    () => computeSavingsProgress(breakdown, settings, monthFlexibleSpent),
    [breakdown, settings, monthFlexibleSpent],
  );

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(Math.round(savings.goalTarget)));
  const onTrack = savings.saved >= savings.goalTarget;
  const isLastDayOfMonth = today.getDate() === new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthClosedComplete = monthlyRecords[monthKey]?.completedSavingsGoal ?? false;
  const showBigCelebration = monthClosedComplete || (onTrack && isLastDayOfMonth);

  const history = useMemo(
    () =>
      Object.values(monthlyRecords)
        .filter((r) => r.completedSavingsGoal)
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
        .slice(0, 12),
    [monthlyRecords],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Goals</h1>
        <p className="text-ink-soft mt-1">Small, steady steps add up.</p>
      </header>

      <Card tone="lavender">
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-ink">{monthShort(today)} Savings Goal 🌱</p>
          {!editingGoal && (
            <button
              type="button"
              onClick={() => {
                setGoalInput(String(Math.round(savings.goalTarget)));
                setEditingGoal(true);
              }}
              className="text-xs font-semibold text-ink-soft underline decoration-dotted"
            >
              Change goal
            </button>
          )}
        </div>

        {editingGoal ? (
          <form
            className="flex items-center gap-2 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = Number(goalInput);
              if (!Number.isNaN(parsed) && parsed > 0) setSavingsGoalTarget(parsed);
              setEditingGoal(false);
            }}
          >
            <span className="text-ink-soft" aria-hidden>
              ฿
            </span>
            <input
              autoFocus
              inputMode="decimal"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 bg-white rounded-cozy-sm px-3 py-2 text-sm ring-1 ring-black/[0.06] outline-none focus:ring-2 focus:ring-coral"
            />
            <button type="submit" className="px-3 py-2 rounded-full bg-coral text-white text-xs font-semibold">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setSavingsGoalTarget(null);
                setEditingGoal(false);
              }}
              className="px-3 py-2 rounded-full bg-black/[0.05] text-ink-soft text-xs font-semibold"
            >
              Use default
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center mt-4">
            <RingProgress
              progress={savings.progress}
              color={onTrack ? "var(--color-sage-deep)" : "var(--color-coral)"}
            >
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-ink">{formatPercent(savings.progress)}</p>
                <p className="text-[11px] text-ink-soft">on track</p>
              </div>
            </RingProgress>
            <p className="text-xs text-ink-soft mt-2">Projected if the month ended today</p>

            <div className="grid grid-cols-3 gap-3 w-full mt-5 text-center">
              <div>
                <p className="text-[11px] text-ink-soft">Target</p>
                <p className="text-sm font-semibold text-ink mt-0.5">{formatBaht(savings.goalTarget)}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-soft">Saved</p>
                <p className="text-sm font-semibold text-ink mt-0.5">{formatBaht(savings.saved)}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-soft">Remaining</p>
                <p className="text-sm font-semibold text-ink mt-0.5">{formatBaht(savings.remaining)}</p>
              </div>
            </div>

            {showBigCelebration ? (
              <div className="mt-4 text-center">
                <p className="font-display font-semibold text-ink">🌸 You did it!</p>
                <p className="text-sm text-ink-soft mt-0.5">
                  Your {monthLabel(today)} savings goal is complete. {formatBaht(savings.goalTarget)} safely saved.
                </p>
              </div>
            ) : onTrack ? (
              <p className="text-sm text-sage-deep font-medium text-center mt-4">
                You're on pace to hit your goal this month 🌷
              </p>
            ) : (
              <p className="text-sm text-ink-soft text-center mt-4">
                A little over the flexible budget right now — there's still time to gently course-correct.
              </p>
            )}
          </div>
        )}
      </Card>

      <Card tone="sage">
        <p className="font-display font-semibold text-ink text-center mb-1">Savings garden</p>
        <Garden streakDays={streaks.dailyBudget.current} />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StreakStat
          emoji="🔥"
          value={streaks.dailyBudget.current}
          label={streaks.dailyBudget.current === 1 ? "day streak" : "day streak"}
          detail="Mindful spending days in a row"
        />
        <StreakStat
          emoji="🌱"
          value={streaks.savingsStreak.current}
          label={streaks.savingsStreak.current === 1 ? "month savings streak" : "month savings streak"}
          detail="You're building a beautiful habit"
        />
        <StreakStat
          emoji="🌸"
          value={streaks.monthlyBudgetStreak.current}
          label="months under budget"
          detail="Flexible spending within plan"
        />
      </div>

      {history.length > 0 && (
        <Card tone="white">
          <p className="font-display font-semibold text-ink mb-3">Garden history</p>
          <div className="flex flex-wrap gap-2">
            {history.map((r) => (
              <span
                key={r.monthKey}
                className="flex items-center gap-1.5 bg-blush/50 rounded-full px-3 py-1.5 text-xs font-medium text-ink"
              >
                🌸 {r.monthKey}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StreakStat({ emoji, value, label, detail }: { emoji: string; value: number; label: string; detail: string }) {
  return (
    <Card tone="white" className="text-center">
      <p className="text-2xl" aria-hidden>
        {emoji}
      </p>
      <p className="font-display text-2xl font-bold text-ink mt-1">{value}</p>
      <p className="text-xs text-ink-soft mt-0.5">{label}</p>
      <p className="text-[11px] text-ink-soft mt-1.5">{detail}</p>
    </Card>
  );
}
