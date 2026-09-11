import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { paletteFor } from "../lib/palette";
import { toDateKey } from "../lib/date";
import type { Expense } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  editingExpense?: Expense | null;
}

export function AddExpenseModal({ open, onClose, editingExpense }: Props) {
  const categories = useStore((s) => s.settings.categories);
  const addExpense = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const reducedMotion = useReducedMotion();

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "others");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setCategoryId(editingExpense.category);
      setDate(editingExpense.date);
      setNote(editingExpense.note ?? "");
    } else {
      setAmount("");
      setCategoryId(categories[0]?.id ?? "others");
      setDate(toDateKey(new Date()));
      setNote("");
    }
    setError(null);
    const t = setTimeout(() => amountRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, editingExpense, categories]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Add an amount greater than ฿0.");
      return;
    }
    if (!categoryId) {
      setError("Pick a category.");
      return;
    }
    if (editingExpense) {
      updateExpense(editingExpense.id, { amount: parsed, category: categoryId, date, note: note.trim() || undefined });
    } else {
      addExpense({ amount: parsed, category: categoryId, date, note: note.trim() || undefined });
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-expense-title"
            onSubmit={handleSubmit}
            initial={reducedMotion ? { opacity: 0 } : { y: "100%", opacity: 0.6 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative bg-cream w-full sm:max-w-md rounded-t-cozy sm:rounded-cozy p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto no-scrollbar shadow-lift"
          >
            <div className="w-10 h-1.5 rounded-full bg-black/10 mx-auto mb-4 sm:hidden" aria-hidden />

            <h2 id="add-expense-title" className="font-display text-xl font-bold text-ink">
              {editingExpense ? "Edit expense" : "Add expense"}
            </h2>

            <div className="mt-5">
              <label htmlFor="expense-amount" className="text-sm font-medium text-ink-soft">
                Amount
              </label>
              <div className="mt-1.5 flex items-center gap-2 bg-white rounded-cozy-sm px-4 py-3 ring-1 ring-black/[0.05] focus-within:ring-2 focus-within:ring-coral">
                <span className="text-xl text-ink-soft" aria-hidden>
                  ฿
                </span>
                <input
                  ref={amountRef}
                  id="expense-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 bg-transparent text-2xl font-display font-semibold text-ink outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-ink-soft mb-2">Category</p>
              <div className="grid grid-cols-4 gap-2.5" role="radiogroup" aria-label="Category">
                {categories.map((c) => {
                  const palette = paletteFor(c.color);
                  const selected = categoryId === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setCategoryId(c.id)}
                      className={`flex flex-col items-center gap-1 rounded-cozy-sm py-2.5 transition-all ${
                        palette.bg
                      } ${selected ? "ring-2 ring-coral scale-[1.04]" : "ring-1 ring-black/[0.04]"}`}
                    >
                      <span className="text-xl" aria-hidden>
                        {c.icon}
                      </span>
                      <span className="text-[10px] font-medium text-ink truncate max-w-full px-1">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div>
                <label htmlFor="expense-date" className="text-sm font-medium text-ink-soft">
                  Date
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={date}
                  max={toDateKey(new Date())}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full bg-white rounded-cozy-sm px-3 py-2.5 ring-1 ring-black/[0.05] text-sm text-ink outline-none focus:ring-2 focus:ring-coral"
                />
              </div>
              <div>
                <label htmlFor="expense-note" className="text-sm font-medium text-ink-soft">
                  Note (optional)
                </label>
                <input
                  id="expense-note"
                  type="text"
                  value={note}
                  maxLength={60}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Iced latte"
                  className="mt-1.5 w-full bg-white rounded-cozy-sm px-3 py-2.5 ring-1 ring-black/[0.05] text-sm text-ink outline-none focus:ring-2 focus:ring-coral"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-coral mt-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-ink-soft bg-black/[0.04] hover:bg-black/[0.07] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full py-3 text-sm font-semibold text-white bg-coral hover:brightness-105 shadow-softer transition-all"
              >
                {editingExpense ? "Save changes" : "Add expense"}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
