import { useMemo } from "react";
import { useStore } from "../store/useStore";
import { computeBudgetBreakdown, computeDailyGuide, expensesForDate, spendingMood, sumExpenses } from "../lib/budget";
import { monthLabel, toDateKey } from "../lib/date";
import { BudgetAllocationCard } from "../components/BudgetAllocationCard";
import { SpendingCard } from "../components/SpendingCard";
import { TodayCard } from "../components/TodayCard";
import { TransactionItem } from "../components/TransactionItem";
import { Card } from "../components/ui/Card";
import { formatBaht } from "../lib/format";
import type { Expense } from "../types";

interface Props {
  onEditExpense: (expense: Expense) => void;
}

function greeting(hour: number): { text: string; emoji: string } {
  if (hour < 5) return { text: "Resting well", emoji: "🌙" };
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 18) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

export function Home({ onEditExpense }: Props) {
  const settings = useStore((s) => s.settings);
  const expenses = useStore((s) => s.expenses);

  const today = useMemo(() => new Date(), []);
  const breakdown = useMemo(() => computeBudgetBreakdown(settings), [settings]);
  const guide = useMemo(() => computeDailyGuide(settings, breakdown, expenses, today), [settings, breakdown, expenses, today]);
  const todayExpenses = useMemo(
    () => expensesForDate(expenses, toDateKey(today)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [expenses, today],
  );
  const todayTotal = sumExpenses(todayExpenses);
  const mood = spendingMood(guide.monthSpentTotal, breakdown.monthlySpendingLimit);
  const g = greeting(today.getHours());

  const subheading =
    mood === "over" ? "Let's tend to your budget together 🌿" : "Your money is blooming nicely.";

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">
          {g.text} {g.emoji}
        </h1>
        <p className="text-ink-soft mt-1">{subheading}</p>
        <p className="text-xs text-ink-soft mt-2 uppercase tracking-wide">{monthLabel(today)}</p>
      </header>

      <BudgetAllocationCard breakdown={breakdown} settings={settings} />
      <SpendingCard monthLabel={monthLabel(today).split(" ")[0]} spent={guide.monthSpentTotal} limit={breakdown.monthlySpendingLimit} />
      <TodayCard guide={guide} />

      <Card tone="white">
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-ink">Today's transactions</p>
          <span className="text-sm text-ink-soft">{todayExpenses.length}</span>
        </div>

        {todayExpenses.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-8">
            No spending logged yet today 🌱
            <br />
            Tap "Add expense" whenever you're ready.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mt-3">
            {todayExpenses.map((e) => (
              <TransactionItem key={e.id} expense={e} onEdit={onEditExpense} />
            ))}
          </div>
        )}

        {todayExpenses.length > 0 && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/[0.05]">
            <span className="text-sm text-ink-soft">Today's total</span>
            <span className="font-semibold text-ink">{formatBaht(todayTotal)}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
