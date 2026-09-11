import type { Expense, UserSettings } from "../types";
import { monthKeyFromDateKey, remainingDaysInMonth, toDateKey, toMonthKey } from "./date";
import { clamp } from "./format";

export interface BudgetBreakdown {
  monthlyIncome: number;
  savingsTarget: number;
  fixedCosts: number;
  monthlySpendingLimit: number;
  rent: number;
  utilitiesAndOtherFixed: number;
}

/** All allocation figures are derived from income + percentages — never hardcoded. */
export function computeBudgetBreakdown(settings: UserSettings): BudgetBreakdown {
  const { monthlyIncome, savingsPercentage, fixedCostPercentage, spendingPercentage, rentPercentage } = settings;
  const fixedCosts = monthlyIncome * fixedCostPercentage;
  const rent = monthlyIncome * rentPercentage;
  return {
    monthlyIncome,
    savingsTarget: monthlyIncome * savingsPercentage,
    fixedCosts,
    monthlySpendingLimit: monthlyIncome * spendingPercentage,
    rent,
    utilitiesAndOtherFixed: fixedCosts - rent,
  };
}

export function allocationIsValid(settings: UserSettings): boolean {
  const total = settings.savingsPercentage + settings.fixedCostPercentage + settings.spendingPercentage;
  return Math.abs(total - 1) < 0.001;
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function expensesForMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((e) => monthKeyFromDateKey(e.date) === monthKey);
}

export function expensesForDate(expenses: Expense[], dateKey: string): Expense[] {
  return expenses.filter((e) => e.date === dateKey);
}

export function expensesBeforeDate(expenses: Expense[], monthKey: string, dateKey: string): Expense[] {
  return expenses.filter((e) => monthKeyFromDateKey(e.date) === monthKey && e.date < dateKey);
}

export interface DailyGuideResult {
  dailyGuide: number;
  monthSpentBeforeToday: number;
  monthSpentTotal: number;
  todaySpent: number;
  todayRemaining: number;
  remainingMonthlySpending: number;
  remainingDays: number;
}

/**
 * dailyGuide = (monthlySpendingLimit - spending logged before today) / days remaining (incl. today)
 * Computed from spending *before* today so the guide holds steady through the day
 * rather than shifting as you log today's own expenses.
 */
export function computeDailyGuide(
  settings: UserSettings,
  breakdown: BudgetBreakdown,
  expenses: Expense[],
  today: Date,
): DailyGuideResult {
  const monthKey = toMonthKey(today);
  const todayKey = toDateKey(today);
  const monthExpenses = expensesForMonth(expenses, monthKey);
  const monthSpentTotal = sumExpenses(monthExpenses);
  const monthSpentBeforeToday = sumExpenses(expensesBeforeDate(expenses, monthKey, todayKey));
  const todaySpent = sumExpenses(expensesForDate(expenses, todayKey));
  const remainingDays = remainingDaysInMonth(today);
  const remainingMonthlySpending = breakdown.monthlySpendingLimit - monthSpentTotal;

  let dailyGuide: number;
  if (settings.dailyBudgetMode === "fixed") {
    dailyGuide = settings.fixedDailyAmount;
  } else {
    const remainingBeforeToday = breakdown.monthlySpendingLimit - monthSpentBeforeToday;
    dailyGuide = remainingDays > 0 ? remainingBeforeToday / remainingDays : remainingBeforeToday;
  }

  return {
    dailyGuide,
    monthSpentBeforeToday,
    monthSpentTotal,
    todaySpent,
    todayRemaining: dailyGuide - todaySpent,
    remainingMonthlySpending,
    remainingDays,
  };
}

export type SpendingMood = "healthy" | "close" | "over";

export function spendingMood(spent: number, limit: number): SpendingMood {
  if (limit <= 0) return "healthy";
  const ratio = spent / limit;
  if (ratio > 1) return "over";
  if (ratio >= 0.85) return "close";
  return "healthy";
}

export interface SavingsProgress {
  goalTarget: number;
  saved: number;
  remaining: number;
  progress: number;
  overSpend: number;
  underSpend: number;
}

/**
 * Savings for the month stay intact as long as flexible spending stays within the
 * monthly limit. Overspending eats into savings baht-for-baht; underspending banks
 * a bonus toward a custom (higher) savings goal.
 */
export function computeSavingsProgress(
  breakdown: BudgetBreakdown,
  settings: UserSettings,
  monthFlexibleSpent: number,
): SavingsProgress {
  const goalTarget = settings.savingsGoalTarget ?? breakdown.savingsTarget;
  const overSpend = Math.max(0, monthFlexibleSpent - breakdown.monthlySpendingLimit);
  const underSpend = Math.max(0, breakdown.monthlySpendingLimit - monthFlexibleSpent);
  const saved = clamp(breakdown.savingsTarget - overSpend + underSpend, 0, goalTarget);
  return {
    goalTarget,
    saved,
    remaining: Math.max(0, goalTarget - saved),
    progress: goalTarget > 0 ? clamp(saved / goalTarget, 0, 1) : 0,
    overSpend,
    underSpend,
  };
}

export function categoryTotals(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  return totals;
}
