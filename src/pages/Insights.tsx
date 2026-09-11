import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useStore } from "../store/useStore";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { computeBudgetBreakdown, categoryTotals, expensesForMonth, sumExpenses } from "../lib/budget";
import { daysInMonthOf, monthLabel, toMonthKey } from "../lib/date";
import { formatBaht } from "../lib/format";
import { paletteFor } from "../lib/palette";
import { buildInsights } from "../lib/insights";

export function Insights() {
  const settings = useStore((s) => s.settings);
  const expenses = useStore((s) => s.expenses);
  const today = useMemo(() => new Date(), []);
  const monthKey = toMonthKey(today);

  const breakdown = useMemo(() => computeBudgetBreakdown(settings), [settings]);
  const monthExpenses = useMemo(() => expensesForMonth(expenses, monthKey), [expenses, monthKey]);
  const monthTotal = sumExpenses(monthExpenses);
  const totals = useMemo(() => categoryTotals(monthExpenses), [monthExpenses]);

  const donutData = useMemo(
    () =>
      settings.categories
        .map((c) => ({ name: c.label, value: totals[c.id] ?? 0, color: paletteFor(c.color).hexDeep, icon: c.icon }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [settings.categories, totals],
  );

  const trendData = useMemo(() => {
    const days = daysInMonthOf(today);
    const perDay = new Map<string, number>();
    for (const e of monthExpenses) perDay.set(e.date, (perDay.get(e.date) ?? 0) + e.amount);
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
      return { day, amount: Math.round(perDay.get(dateKey) ?? 0) };
    });
  }, [monthExpenses, monthKey, today]);

  const insights = useMemo(
    () => buildInsights(expenses, settings, settings.categories, today),
    [expenses, settings, today],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Insights</h1>
        <p className="text-ink-soft mt-1">A gentle look at your habits.</p>
      </header>

      <Card tone="white">
        <p className="text-sm text-ink-soft">{monthLabel(today)} spending</p>
        <div className="flex items-end justify-between mt-1">
          <p className="font-display text-2xl font-bold text-ink">{formatBaht(monthTotal)}</p>
          <p className="text-sm text-ink-soft">limit {formatBaht(breakdown.monthlySpendingLimit)}</p>
        </div>
        <div className="mt-3">
          <ProgressBar value={monthTotal} max={breakdown.monthlySpendingLimit} color="var(--color-lavender-deep)" />
        </div>
      </Card>

      <Card tone="white">
        <p className="font-display font-semibold text-ink mb-2">Category breakdown</p>
        {donutData.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-10">Nothing spent yet this month 🌸</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatBaht(Number(value ?? 0)), String(name)]}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.06)",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 w-full flex flex-col gap-2">
              {donutData.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
                    <span aria-hidden>{d.icon}</span> {d.name}
                  </span>
                  <span className="text-ink-soft">{formatBaht(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card tone="white">
        <p className="font-display font-semibold text-ink mb-2">Spending trend</p>
        <div className="h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barCategoryGap={2}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                interval={Math.ceil(trendData.length / 8)}
                tick={{ fontSize: 11, fill: "#8A838C" }}
              />
              <Tooltip
                formatter={(value) => [formatBaht(Number(value ?? 0)), "Spent"]}
                labelFormatter={(day) => `Day ${day}`}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(0,0,0,0.06)",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 6, 6]} fill="#F0B9CB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card tone="lavender">
        <p className="font-display font-semibold text-ink mb-2">Insights</p>
        <ul className="flex flex-col gap-2.5">
          {insights.map((i) => (
            <li key={i.id} className="text-sm text-ink flex items-start gap-2">
              <span aria-hidden>🌸</span>
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
