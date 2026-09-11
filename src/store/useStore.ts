import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  CelebrationEvent,
  DailyBudgetMode,
  Expense,
  MonthlyRecord,
  StreaksData,
  UserSettings,
} from "../types";
import { DEFAULT_CATEGORIES } from "../lib/categories";
import {
  computeBudgetBreakdown,
  computeDailyGuide,
  computeSavingsProgress,
  expensesForDate,
  expensesForMonth,
  sumExpenses,
} from "../lib/budget";
import { daysInMonthOf, parseDateKey, toDateKey, toMonthKey } from "../lib/date";
import { formatBaht } from "../lib/format";

const DEFAULT_SETTINGS: UserSettings = {
  monthlyIncome: 25000,
  savingsPercentage: 0.3,
  fixedCostPercentage: 0.2,
  spendingPercentage: 0.5,
  rentPercentage: 0.15,
  dailyBudgetMode: "adaptive",
  fixedDailyAmount: 417,
  currency: "THB",
  categories: DEFAULT_CATEGORIES,
  celebrationsEnabled: true,
  reducedMotionOverride: false,
  savingsGoalTarget: null,
};

const EMPTY_STREAKS: StreaksData = {
  dailyBudget: { current: 0, longest: 0 },
  savingsStreak: { current: 0, longest: 0 },
  monthlyBudgetStreak: { current: 0, longest: 0 },
};

interface Store {
  settings: UserSettings;
  expenses: Expense[];
  monthlyRecords: Record<string, MonthlyRecord>;
  streaks: StreaksData;
  lastSeenDate: string | null;
  celebration: CelebrationEvent | null;

  addExpense: (input: { amount: number; category: string; date: string; note?: string }) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  deleteExpense: (id: string) => void;

  updateSettings: (patch: Partial<UserSettings>) => void;
  setDailyBudgetMode: (mode: DailyBudgetMode) => void;
  setCategories: (categories: Category[]) => void;
  setSavingsGoalTarget: (value: number | null) => void;

  dismissCelebration: () => void;
  syncTime: (today: Date) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
}

function celebrate(
  set: (fn: (s: Store) => Partial<Store>) => void,
  level: CelebrationEvent["level"],
  message: string,
  detail?: string,
) {
  set(() => ({ celebration: { id: crypto.randomUUID(), level, message, detail } }));
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      expenses: [],
      monthlyRecords: {},
      streaks: EMPTY_STREAKS,
      lastSeenDate: null,
      celebration: null,

      addExpense: (input) => {
        const expense: Expense = {
          id: crypto.randomUUID(),
          amount: input.amount,
          category: input.category,
          note: input.note?.trim() || undefined,
          date: input.date,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ expenses: [...s.expenses, expense] }));

        const { settings, expenses, streaks } = get();
        const today = new Date();
        if (settings.celebrationsEnabled && input.date === toDateKey(today)) {
          const breakdown = computeBudgetBreakdown(settings);
          const guide = computeDailyGuide(settings, breakdown, expenses, today);
          if (guide.todayRemaining >= 0) {
            const streakBonus = streaks.dailyBudget.current >= 3;
            celebrate(
              set,
              "small",
              streakBonus ? "✨ On a roll! Still under today's guide." : "✨ Nice! Still under today's guide.",
              `${formatBaht(guide.todayRemaining)} left from today's guide.`,
            );
          }
        }
      },

      updateExpense: (id, patch) => {
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      deleteExpense: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      setDailyBudgetMode: (mode) => {
        set((s) => ({ settings: { ...s.settings, dailyBudgetMode: mode } }));
      },

      setCategories: (categories) => {
        set((s) => ({ settings: { ...s.settings, categories } }));
      },

      setSavingsGoalTarget: (value) => {
        set((s) => ({ settings: { ...s.settings, savingsGoalTarget: value } }));
      },

      dismissCelebration: () => set(() => ({ celebration: null })),

      syncTime: (today) => {
        const todayKey = toDateKey(today);
        const { lastSeenDate } = get();

        if (lastSeenDate === todayKey) return;
        if (lastSeenDate === null) {
          set(() => ({ lastSeenDate: todayKey }));
          return;
        }

        let cursor = parseDateKey(lastSeenDate);
        let guard = 0;
        const settings = get().settings;

        while (toDateKey(cursor) < todayKey && guard < 3650) {
          guard += 1;
          const cursorKey = toDateKey(cursor);
          const cursorMonthKey = toMonthKey(cursor);
          const breakdown = computeBudgetBreakdown(settings);
          const expenses = get().expenses;

          // Evaluate the daily streak for the day that just closed.
          const guide = computeDailyGuide(settings, breakdown, expenses, cursor);
          const spentThatDay = sumExpenses(expensesForDate(expenses, cursorKey));
          set((s) => {
            const prev = s.streaks.dailyBudget;
            const staysUnder = spentThatDay <= guide.dailyGuide;
            const current = staysUnder ? prev.current + 1 : 0;
            return {
              streaks: {
                ...s.streaks,
                dailyBudget: { current, longest: Math.max(prev.longest, current), lastDate: cursorKey },
              },
            };
          });

          // If this was the last day of its month, close out the month.
          const isLastDayOfMonth = cursor.getDate() === daysInMonthOf(cursor);
          if (isLastDayOfMonth) {
            const monthExpenses = expensesForMonth(expenses, cursorMonthKey);
            const monthFlexibleSpent = sumExpenses(monthExpenses);
            const savings = computeSavingsProgress(breakdown, settings, monthFlexibleSpent);
            const underBudget = monthFlexibleSpent <= breakdown.monthlySpendingLimit;
            const completedSavingsGoal = savings.saved >= savings.goalTarget;

            const record: MonthlyRecord = {
              monthKey: cursorMonthKey,
              savingsGoalTarget: savings.goalTarget,
              completedSavingsGoal,
              completedAt: completedSavingsGoal ? new Date().toISOString() : undefined,
              underBudget,
            };
            set((s) => ({ monthlyRecords: { ...s.monthlyRecords, [cursorMonthKey]: record } }));

            set((s) => {
              const prevMonthly = s.streaks.monthlyBudgetStreak;
              const monthlyCurrent = underBudget ? prevMonthly.current + 1 : 0;
              const prevSavings = s.streaks.savingsStreak;
              const savingsCurrent = completedSavingsGoal ? prevSavings.current + 1 : 0;
              return {
                streaks: {
                  ...s.streaks,
                  monthlyBudgetStreak: {
                    current: monthlyCurrent,
                    longest: Math.max(prevMonthly.longest, monthlyCurrent),
                    lastMonthKey: cursorMonthKey,
                  },
                  savingsStreak: {
                    current: savingsCurrent,
                    longest: Math.max(prevSavings.longest, savingsCurrent),
                    lastMonthKey: cursorMonthKey,
                  },
                },
              };
            });

            if (settings.celebrationsEnabled) {
              if (completedSavingsGoal) {
                celebrate(
                  set,
                  "big",
                  "🎉 Savings goal complete!",
                  `${formatBaht(savings.goalTarget)} saved this month. The garden grew a new flower!`,
                );
              } else if (underBudget) {
                celebrate(set, "medium", "🌸 Your month is looking beautiful!", "You stayed within your spending plan.");
              }
            }
          }

          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
        }

        set(() => ({ lastSeenDate: todayKey }));
      },

      loadDemoData: () => {
        const today = new Date();
        const sample: Array<{ daysAgo: number; amount: number; category: string; note?: string }> = [
          { daysAgo: 0, amount: 85, category: "coffee" },
          { daysAgo: 0, amount: 120, category: "meals", note: "Lunch" },
          { daysAgo: 1, amount: 650, category: "groceries" },
          { daysAgo: 1, amount: 45, category: "snacks" },
          { daysAgo: 2, amount: 420, category: "skincare" },
          { daysAgo: 3, amount: 100, category: "others" },
          { daysAgo: 4, amount: 1200, category: "clothes" },
          { daysAgo: 5, amount: 85, category: "coffee" },
          { daysAgo: 5, amount: 150, category: "meals", note: "Dinner" },
        ];
        const expenses: Expense[] = sample.map((s) => {
          const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - s.daysAgo);
          return {
            id: crypto.randomUUID(),
            amount: s.amount,
            category: s.category,
            note: s.note,
            date: toDateKey(d),
            createdAt: d.toISOString(),
          };
        });
        set(() => ({ expenses }));
      },

      resetAllData: () => {
        set(() => ({
          expenses: [],
          monthlyRecords: {},
          streaks: EMPTY_STREAKS,
          celebration: null,
          lastSeenDate: toDateKey(new Date()),
        }));
      },
    }),
    {
      name: "bloom-budget-store",
      version: 1,
      partialize: (s) => ({
        settings: s.settings,
        expenses: s.expenses,
        monthlyRecords: s.monthlyRecords,
        streaks: s.streaks,
        lastSeenDate: s.lastSeenDate,
      }),
    },
  ),
);
