import { Card } from "./ui/Card";
import { AllocationBar } from "./ui/ProgressBar";
import { formatBaht, formatPercent } from "../lib/format";
import type { BudgetBreakdown } from "../lib/budget";
import type { UserSettings } from "../types";

interface Props {
  breakdown: BudgetBreakdown;
  settings: UserSettings;
}

export function BudgetAllocationCard({ breakdown, settings }: Props) {
  const segments = [
    { label: "Savings", value: breakdown.savingsTarget, color: "#A9CFAE" },
    { label: "Fixed costs", value: breakdown.fixedCosts, color: "#C9B6EC" },
    { label: "Spending", value: breakdown.monthlySpendingLimit, color: "#F0B9CB" },
  ];

  return (
    <Card tone="white">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm text-ink-soft">Monthly income</p>
          <p className="font-display text-3xl font-bold text-ink mt-0.5">{formatBaht(breakdown.monthlyIncome)}</p>
        </div>
        <span className="text-2xl" aria-hidden>
          💌
        </span>
      </div>

      <div className="mt-5">
        <AllocationBar segments={segments} />
        <div className="flex justify-between text-[11px] text-ink-soft mt-1.5">
          <span>{formatPercent(settings.savingsPercentage)} saved</span>
          <span>{formatPercent(settings.fixedCostPercentage)} fixed</span>
          <span>{formatPercent(settings.spendingPercentage)} spending</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <AllocationStat icon="🌱" label="Savings" value={breakdown.savingsTarget} dot="#A9CFAE" />
        <AllocationStat icon="🏠" label="Fixed costs" value={breakdown.fixedCosts} dot="#C9B6EC" />
        <AllocationStat icon="🌸" label="Spending" value={breakdown.monthlySpendingLimit} dot="#F0B9CB" />
      </div>

      <div className="mt-4 pt-4 border-t border-black/[0.05] flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-soft">Rent</span>
          <span className="text-ink font-medium">{formatBaht(breakdown.rent)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-soft">Utilities &amp; other fixed</span>
          <span className="text-ink font-medium">{formatBaht(breakdown.utilitiesAndOtherFixed)}</span>
        </div>
      </div>
    </Card>
  );
}

function AllocationStat({ icon, label, value, dot }: { icon: string; label: string; value: number; dot: string }) {
  return (
    <div className="rounded-cozy-sm bg-black/[0.02] p-3">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} aria-hidden />
        <span className="text-[11px] text-ink-soft leading-none">{label}</span>
      </div>
      <p className="text-sm font-semibold text-ink mt-1.5">
        <span aria-hidden>{icon} </span>
        {formatBaht(value)}
      </p>
    </div>
  );
}
