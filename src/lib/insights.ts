import type { Category, Expense, UserSettings } from "../types";
import { categoryTotals, computeBudgetBreakdown, expensesForMonth, sumExpenses } from "./budget";
import { daysInMonthOf, monthShort, toMonthKey } from "./date";
import { formatBaht, formatPercent } from "./format";

export interface Insight {
  id: string;
  text: string;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function buildInsights(
  expenses: Expense[],
  settings: UserSettings,
  categories: Category[],
  today: Date,
): Insight[] {
  const insights: Insight[] = [];
  const monthKey = toMonthKey(today);
  const lastMonthDate = addMonths(today, -1);
  const lastMonthKey = toMonthKey(lastMonthDate);

  const thisMonthExpenses = expensesForMonth(expenses, monthKey);
  const lastMonthExpenses = expensesForMonth(expenses, lastMonthKey);
  const breakdown = computeBudgetBreakdown(settings);

  if (thisMonthExpenses.length === 0) {
    return [{ id: "empty", text: "Log a few expenses and your first insights will bloom here 🌱" }];
  }

  const thisTotals = categoryTotals(thisMonthExpenses);
  const lastTotals = categoryTotals(lastMonthExpenses);

  // Biggest category this month.
  const biggest = Object.entries(thisTotals).sort((a, b) => b[1] - a[1])[0];
  if (biggest) {
    const cat = categories.find((c) => c.id === biggest[0]);
    if (cat) {
      insights.push({
        id: "biggest",
        text: `${cat.label} ${cat.label.toLowerCase() === "meals" ? "are" : "is"} currently your biggest spending category ${cat.icon}`,
      });
    }
  }

  // Category down vs last month (needs real last-month data).
  if (lastMonthExpenses.length > 0) {
    let bestDrop: { id: string; pct: number } | null = null;
    for (const cat of categories) {
      const prev = lastTotals[cat.id] ?? 0;
      const curr = thisTotals[cat.id] ?? 0;
      if (prev <= 0) continue;
      const pct = (prev - curr) / prev;
      if (pct > 0.15 && (!bestDrop || pct > bestDrop.pct)) {
        bestDrop = { id: cat.id, pct };
      }
    }
    if (bestDrop) {
      const cat = categories.find((c) => c.id === bestDrop!.id)!;
      insights.push({
        id: "drop",
        text: `You spent less on ${cat.label.toLowerCase()} this month than last month ${cat.icon}`,
      });
    }
  }

  // Remaining flexible budget.
  const monthTotal = sumExpenses(thisMonthExpenses);
  const remaining = breakdown.monthlySpendingLimit - monthTotal;
  insights.push({
    id: "remaining",
    text:
      remaining >= 0
        ? `You have ${formatBaht(remaining)} remaining in your flexible spending budget 🌸`
        : `You're ${formatBaht(Math.abs(remaining))} past this month's flexible spending budget — tomorrow is a fresh start 🌿`,
  });

  // Average daily spending vs guide (needs a handful of data points).
  const isCurrentMonth = monthKey === toMonthKey(today);
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonthOf(today);
  if (thisMonthExpenses.length >= 3 && elapsedDays >= 2) {
    const avgDaily = monthTotal / elapsedDays;
    const avgGuide = breakdown.monthlySpendingLimit / daysInMonthOf(today);
    insights.push({ id: "avg", text: `Your average daily spending is ${formatBaht(avgDaily)}.` });

    if (avgGuide > 0) {
      const diffPct = (avgGuide - avgDaily) / avgGuide;
      if (Math.abs(diffPct) >= 0.03) {
        insights.push({
          id: "pace",
          text:
            diffPct > 0
              ? `You're spending ${formatPercent(diffPct)} less than your daily guide. 🌷`
              : `You're spending ${formatPercent(-diffPct)} more than your daily guide.`,
        });
      }
    }
  }

  return insights;
}

export function monthOverMonthLabel(today: Date): { current: string; previous: string } {
  return { current: monthShort(today), previous: monthShort(addMonths(today, -1)) };
}
