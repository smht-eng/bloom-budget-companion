export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  /** Token key into the pastel palette, e.g. "blush" | "lavender" | "sage" | "baby-blue" | "butter" | "coral" */
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  note?: string;
  /** yyyy-MM-dd, local date the expense belongs to */
  date: string;
  createdAt: string;
}

export type DailyBudgetMode = "adaptive" | "fixed";

export interface UserSettings {
  monthlyIncome: number;
  savingsPercentage: number;
  fixedCostPercentage: number;
  spendingPercentage: number;
  /** portion of income, subset of fixedCostPercentage */
  rentPercentage: number;
  dailyBudgetMode: DailyBudgetMode;
  fixedDailyAmount: number;
  currency: "THB";
  categories: Category[];
  celebrationsEnabled: boolean;
  reducedMotionOverride: boolean;
  /** custom savings goal target; defaults to computed savingsTarget when unset */
  savingsGoalTarget: number | null;
}

export interface MonthlyRecord {
  monthKey: string;
  savingsGoalTarget: number;
  completedSavingsGoal: boolean;
  completedAt?: string;
  underBudget: boolean;
}

export interface StreakState {
  current: number;
  longest: number;
  lastDate?: string;
  lastMonthKey?: string;
}

export interface StreaksData {
  dailyBudget: StreakState;
  savingsStreak: StreakState;
  monthlyBudgetStreak: StreakState;
}

export interface CelebrationEvent {
  id: string;
  level: "small" | "medium" | "big";
  message: string;
  detail?: string;
}

export type NavSection = "home" | "track" | "insights" | "goals";
