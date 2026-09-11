import { useState } from "react";
import { motion } from "framer-motion";
import type { Expense } from "../types";
import { formatBaht, formatTime } from "../lib/format";
import { paletteFor } from "../lib/palette";
import { useStore } from "../store/useStore";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface Props {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  showDate?: boolean;
}

export function TransactionItem({ expense, onEdit, showDate }: Props) {
  const categories = useStore((s) => s.settings.categories);
  const deleteExpense = useStore((s) => s.deleteExpense);
  const reducedMotion = useReducedMotion();
  const [dragX, setDragX] = useState(0);

  const category = categories.find((c) => c.id === expense.category);
  const palette = paletteFor(category?.color ?? "blush");
  const revealDelete = dragX < -32;

  return (
    <div className="relative rounded-cozy-sm overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-coral/25" aria-hidden>
        <span className="text-lg transition-opacity" style={{ opacity: revealDelete ? 1 : 0.5 }}>
          🗑️
        </span>
      </div>

      <motion.div
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -48) {
            deleteExpense(expense.id);
          }
          setDragX(0);
        }}
        className="relative bg-white rounded-cozy-sm px-4 py-3 flex items-center gap-3"
      >
        <span
          className={`w-10 h-10 shrink-0 rounded-full ${palette.bg} flex items-center justify-center text-lg`}
          aria-hidden
        >
          {category?.icon ?? "🪴"}
        </span>

        <button
          type="button"
          onClick={() => onEdit(expense)}
          className="flex-1 min-w-0 text-left"
          aria-label={`Edit ${category?.label ?? "expense"}, ${formatBaht(expense.amount)}`}
        >
          <p className="font-semibold text-ink text-sm truncate">{category?.label ?? "Other"}</p>
          <p className="text-xs text-ink-soft truncate">
            {expense.note ? `${expense.note} · ` : ""}
            {showDate ? expense.date : formatTime(expense.createdAt)}
          </p>
        </button>

        <div className="text-right shrink-0">
          <p className="font-semibold text-ink text-sm">{formatBaht(expense.amount)}</p>
        </div>

        <button
          type="button"
          onClick={() => deleteExpense(expense.id)}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-black/[0.04] hover:text-coral transition-colors"
          aria-label={`Delete ${category?.label ?? "expense"}, ${formatBaht(expense.amount)}`}
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
}
