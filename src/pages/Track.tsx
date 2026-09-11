import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { TransactionItem } from "../components/TransactionItem";
import { formatBaht } from "../lib/format";
import { paletteFor } from "../lib/palette";
import { daysInMonthOf, monthLabel, toDateKey, toMonthKey } from "../lib/date";
import { categoryTotals, expensesForMonth, sumExpenses } from "../lib/budget";
import type { Expense } from "../types";

interface Props {
  onEditExpense: (expense: Expense) => void;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function Track({ onEditExpense }: Props) {
  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.settings.categories);

  const [viewMonth, setViewMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const monthKey = toMonthKey(viewMonth);
  const monthExpenses = useMemo(() => expensesForMonth(expenses, monthKey), [expenses, monthKey]);
  const monthTotal = sumExpenses(monthExpenses);
  const totalsByCategory = useMemo(() => categoryTotals(monthExpenses), [monthExpenses]);

  const selectedDateKey =
    selectedDay != null ? toDateKey(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), selectedDay)) : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return monthExpenses
      .filter((e) => (selectedDateKey ? e.date === selectedDateKey : true))
      .filter((e) => (categoryFilter ? e.category === categoryFilter : true))
      .filter((e) => {
        if (!q) return true;
        const label = categories.find((c) => c.id === e.category)?.label.toLowerCase() ?? "";
        return label.includes(q) || (e.note ?? "").toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [monthExpenses, selectedDateKey, categoryFilter, search, categories]);

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const dayCount = daysInMonthOf(viewMonth);
  const daysWithSpending = new Set(monthExpenses.map((e) => Number(e.date.slice(-2))));

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Track</h1>
        <p className="text-ink-soft mt-1">Every baht, gently accounted for.</p>
      </header>

      <Card tone="white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setViewMonth((m) => addMonths(m, -1));
              setSelectedDay(null);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-black/[0.04]"
            aria-label="Previous month"
          >
            ←
          </button>
          <p className="font-display font-semibold text-ink">{monthLabel(viewMonth)}</p>
          <button
            type="button"
            onClick={() => {
              setViewMonth((m) => addMonths(m, 1));
              setSelectedDay(null);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-black/[0.04]"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="flex gap-1.5 mt-4 overflow-x-auto no-scrollbar pb-1" role="listbox" aria-label="Day">
          {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => {
            const active = selectedDay === day;
            const hasSpending = daysWithSpending.has(day);
            return (
              <button
                key={day}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => setSelectedDay(active ? null : day)}
                className={`shrink-0 w-9 h-11 rounded-cozy-sm flex flex-col items-center justify-center text-xs font-medium transition-colors ${
                  active ? "bg-coral text-white" : "bg-black/[0.03] text-ink-soft"
                }`}
              >
                {day}
                <span
                  className={`w-1 h-1 rounded-full mt-1 ${
                    hasSpending ? (active ? "bg-white" : "bg-coral") : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/[0.05] text-sm">
          <div>
            <p className="text-ink-soft text-xs">Monthly total</p>
            <p className="font-semibold text-ink mt-0.5">{formatBaht(monthTotal)}</p>
          </div>
          <div>
            <p className="text-ink-soft text-xs">{selectedDateKey ? "Daily total" : "Showing"}</p>
            <p className="font-semibold text-ink mt-0.5">
              {selectedDateKey ? formatBaht(sumExpenses(monthExpenses.filter((e) => e.date === selectedDateKey))) : "Whole month"}
            </p>
          </div>
        </div>
      </Card>

      <Card tone="white" className="flex flex-col gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions…"
          aria-label="Search transactions"
          className="w-full bg-black/[0.03] rounded-cozy-sm px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-coral"
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${
              categoryFilter === null ? "bg-coral text-white ring-coral" : "bg-white text-ink-soft ring-black/[0.08]"
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const palette = paletteFor(c.color);
            const active = categoryFilter === c.id;
            const total = totalsByCategory[c.id] ?? 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(active ? null : c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ring-1 flex items-center gap-1.5 ${
                  active ? `${palette.bg} ring-black/[0.1]` : "bg-white text-ink-soft ring-black/[0.08]"
                }`}
                title={`${c.label}: ${formatBaht(total)}`}
              >
                <span aria-hidden>{c.icon}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </Card>

      {groups.length === 0 ? (
        <Card tone="white">
          <p className="text-sm text-ink-soft text-center py-8">No transactions match yet. Try a different filter 🌿</p>
        </Card>
      ) : (
        groups.map(([date, items]) => (
          <Card tone="white" key={date}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-ink">{date}</p>
              <p className="text-sm text-ink-soft">{formatBaht(sumExpenses(items))}</p>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((e) => (
                <TransactionItem key={e.id} expense={e} onEdit={onEditExpense} />
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
