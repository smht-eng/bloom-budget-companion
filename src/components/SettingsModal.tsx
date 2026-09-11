import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PALETTE_ORDER, paletteFor } from "../lib/palette";
import { formatBaht } from "../lib/format";
import type { Category } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const setCategories = useStore((s) => s.setCategories);
  const resetAllData = useStore((s) => s.resetAllData);
  const loadDemoData = useStore((s) => s.loadDemoData);
  const reducedMotion = useReducedMotion();

  const [income, setIncome] = useState(String(settings.monthlyIncome));
  const [pct, setPct] = useState({
    savings: Math.round(settings.savingsPercentage * 100),
    fixed: Math.round(settings.fixedCostPercentage * 100),
    spending: Math.round(settings.spendingPercentage * 100),
  });
  const [rentPct, setRentPct] = useState(Math.round(settings.rentPercentage * 100));
  const [newCategory, setNewCategory] = useState({ label: "", icon: "🌷", color: "blush" });
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIncome(String(settings.monthlyIncome));
    setPct({
      savings: Math.round(settings.savingsPercentage * 100),
      fixed: Math.round(settings.fixedCostPercentage * 100),
      spending: Math.round(settings.spendingPercentage * 100),
    });
    setRentPct(Math.round(settings.rentPercentage * 100));
    setConfirmReset(false);
  }, [open, settings]);

  if (!open) return null;

  const pctSum = pct.savings + pct.fixed + pct.spending;
  const pctValid = pctSum === 100;
  const rentValid = rentPct <= pct.fixed;

  function applyIncome() {
    const parsed = Number(income);
    if (!Number.isNaN(parsed) && parsed > 0) updateSettings({ monthlyIncome: parsed });
  }

  function applyAllocation() {
    if (!pctValid) return;
    updateSettings({
      savingsPercentage: pct.savings / 100,
      fixedCostPercentage: pct.fixed / 100,
      spendingPercentage: pct.spending / 100,
    });
  }

  function applyRent() {
    if (!rentValid) return;
    updateSettings({ rentPercentage: rentPct / 100 });
  }

  function addCategory() {
    if (!newCategory.label.trim()) return;
    const cat: Category = {
      id: `custom-${Date.now()}`,
      label: newCategory.label.trim(),
      icon: newCategory.icon || "🌷",
      color: newCategory.color,
    };
    setCategories([...settings.categories, cat]);
    setNewCategory({ label: "", icon: "🌷", color: "blush" });
  }

  function removeCategory(id: string) {
    if (settings.categories.length <= 1) return;
    setCategories(settings.categories.filter((c) => c.id !== id));
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          initial={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="relative bg-cream w-full sm:max-w-lg rounded-t-cozy sm:rounded-cozy p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto no-scrollbar shadow-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="settings-title" className="font-display text-xl font-bold text-ink">
              Settings
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-black/[0.05]"
            >
              ✕
            </button>
          </div>

          <Section title="Monthly income">
            <div className="flex gap-2">
              <MoneyInput value={income} onChange={setIncome} />
              <button type="button" onClick={applyIncome} className="px-4 rounded-cozy-sm bg-coral text-white text-sm font-semibold">
                Save
              </button>
            </div>
          </Section>

          <Section title="Budget allocation" hint={`${pctSum}% allocated${pctValid ? "" : " — must total 100%"}`}>
            <div className="grid grid-cols-3 gap-2">
              <PercentInput label="Savings" value={pct.savings} onChange={(v) => setPct((p) => ({ ...p, savings: v }))} />
              <PercentInput label="Fixed" value={pct.fixed} onChange={(v) => setPct((p) => ({ ...p, fixed: v }))} />
              <PercentInput label="Spending" value={pct.spending} onChange={(v) => setPct((p) => ({ ...p, spending: v }))} />
            </div>
            <button
              type="button"
              onClick={applyAllocation}
              disabled={!pctValid}
              className="mt-2 w-full rounded-cozy-sm py-2 text-sm font-semibold bg-lavender text-ink disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply allocation
            </button>
          </Section>

          <Section title="Rent" hint={`${formatBaht((rentPct / 100) * settings.monthlyIncome)} of income${rentValid ? "" : " — can't exceed fixed costs %"}`}>
            <div className="flex gap-2">
              <PercentInput label="Rent %" value={rentPct} onChange={setRentPct} />
              <button
                type="button"
                onClick={applyRent}
                disabled={!rentValid}
                className="px-4 rounded-cozy-sm bg-coral text-white text-sm font-semibold disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </Section>

          <Section title="Daily budget mode">
            <div className="flex gap-2">
              {(["adaptive", "fixed"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateSettings({ dailyBudgetMode: m })}
                  className={`flex-1 rounded-cozy-sm py-2 text-sm font-medium capitalize ${
                    settings.dailyBudgetMode === m ? "bg-coral text-white" : "bg-black/[0.04] text-ink-soft"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {settings.dailyBudgetMode === "fixed" && (
              <div className="mt-2">
                <MoneyInput
                  value={String(settings.fixedDailyAmount)}
                  onChange={(v) => {
                    const parsed = Number(v);
                    if (!Number.isNaN(parsed)) updateSettings({ fixedDailyAmount: parsed });
                  }}
                />
              </div>
            )}
          </Section>

          <Section title="Categories">
            <div className="flex flex-col gap-2">
              {settings.categories.map((c) => {
                const palette = paletteFor(c.color);
                return (
                  <div key={c.id} className={`flex items-center gap-2 rounded-cozy-sm px-3 py-2 ${palette.bg}`}>
                    <span aria-hidden>{c.icon}</span>
                    <span className="flex-1 text-sm text-ink">{c.label}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(c.id)}
                      aria-label={`Remove ${c.label}`}
                      className="text-ink-soft hover:text-coral text-sm"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                value={newCategory.icon}
                onChange={(e) => setNewCategory((c) => ({ ...c, icon: e.target.value.slice(0, 2) }))}
                className="w-12 text-center bg-white rounded-cozy-sm ring-1 ring-black/[0.06] py-2"
                aria-label="New category icon"
              />
              <input
                value={newCategory.label}
                onChange={(e) => setNewCategory((c) => ({ ...c, label: e.target.value }))}
                placeholder="New category"
                className="flex-1 bg-white rounded-cozy-sm ring-1 ring-black/[0.06] px-3 py-2 text-sm"
                aria-label="New category name"
              />
              <select
                value={newCategory.color}
                onChange={(e) => setNewCategory((c) => ({ ...c, color: e.target.value }))}
                className="bg-white rounded-cozy-sm ring-1 ring-black/[0.06] px-2 text-sm"
                aria-label="New category color"
              >
                {PALETTE_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button type="button" onClick={addCategory} className="px-3 rounded-cozy-sm bg-coral text-white text-sm font-semibold">
                Add
              </button>
            </div>
          </Section>

          <Section title="Celebrations">
            <ToggleRow
              label="Show celebrations"
              checked={settings.celebrationsEnabled}
              onChange={(v) => updateSettings({ celebrationsEnabled: v })}
            />
            <ToggleRow
              label="Reduce motion"
              checked={settings.reducedMotionOverride}
              onChange={(v) => updateSettings({ reducedMotionOverride: v })}
            />
          </Section>

          <Section title="Data">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={loadDemoData}
                className="rounded-cozy-sm py-2.5 text-sm font-semibold bg-black/[0.04] text-ink"
              >
                Load sample data
              </button>
              {confirmReset ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllData();
                      setConfirmReset(false);
                    }}
                    className="flex-1 rounded-cozy-sm py-2.5 text-sm font-semibold bg-coral text-white"
                  >
                    Confirm reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-cozy-sm py-2.5 text-sm font-semibold bg-black/[0.04] text-ink-soft"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="rounded-cozy-sm py-2.5 text-sm font-semibold bg-black/[0.04] text-coral"
                >
                  Reset all data
                </button>
              )}
            </div>
          </Section>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-ink mb-1.5">{title}</p>
      {children}
      {hint && <p className="text-[11px] text-ink-soft mt-1.5">{hint}</p>}
    </div>
  );
}

function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 flex items-center gap-1.5 bg-white rounded-cozy-sm px-3 py-2 ring-1 ring-black/[0.06]">
      <span className="text-ink-soft" aria-hidden>
        ฿
      </span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className="flex-1 bg-transparent outline-none text-sm text-ink"
      />
    </div>
  );
}

function PercentInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-ink-soft">{label}</span>
      <div className="flex items-center bg-white rounded-cozy-sm ring-1 ring-black/[0.06] px-2 py-2">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)}
          className="w-full bg-transparent outline-none text-sm text-ink text-right"
        />
        <span className="text-ink-soft text-sm">%</span>
      </div>
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? "bg-coral" : "bg-black/[0.12]"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
