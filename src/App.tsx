import { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import type { Expense, NavSection } from "./types";
import { BottomNav, SideNav } from "./components/layout/Nav";
import { AddExpenseFab } from "./components/AddExpenseFab";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { SettingsModal } from "./components/SettingsModal";
import { CelebrationToast } from "./components/ui/CelebrationToast";
import { Home } from "./pages/Home";
import { Track } from "./pages/Track";
import { Insights } from "./pages/Insights";
import { Goals } from "./pages/Goals";

export default function App() {
  const [section, setSection] = useState<NavSection>("home");
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const syncTime = useStore((s) => s.syncTime);

  useEffect(() => {
    syncTime(new Date());
    const onVisible = () => {
      if (document.visibilityState === "visible") syncTime(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(() => syncTime(new Date()), 5 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [syncTime]);

  function openAdd() {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <SideNav active={section} onChange={setSection} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden flex items-center justify-between px-4 pt-4">
          <p className="font-display text-lg font-bold text-ink">🌸 Bloom</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/70 text-ink-soft"
          >
            ⚙️
          </button>
        </div>

        <div className="hidden md:flex justify-end px-8 pt-6">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/70 text-sm text-ink-soft hover:bg-white transition-colors"
          >
            <span aria-hidden>⚙️</span> Settings
          </button>
        </div>

        <main className="flex-1 px-4 sm:px-6 md:px-8 pt-4 pb-28 md:pb-16 max-w-3xl w-full mx-auto">
          {section === "home" && <Home onEditExpense={openEdit} />}
          {section === "track" && <Track onEditExpense={openEdit} />}
          {section === "insights" && <Insights />}
          {section === "goals" && <Goals />}
        </main>
      </div>

      <BottomNav active={section} onChange={setSection} />
      <AddExpenseFab onClick={openAdd} />
      <AddExpenseModal
        open={expenseModalOpen}
        editingExpense={editingExpense}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpense(null);
        }}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CelebrationToast />
    </div>
  );
}
