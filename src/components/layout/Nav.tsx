import type { NavSection } from "../../types";

const ITEMS: { id: NavSection; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏡" },
  { id: "track", label: "Track", icon: "📝" },
  { id: "insights", label: "Insights", icon: "📊" },
  { id: "goals", label: "Goals", icon: "🌱" },
];

interface NavProps {
  active: NavSection;
  onChange: (section: NavSection) => void;
}

export function BottomNav({ active, onChange }: NavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-black/[0.05] pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="flex justify-around items-stretch">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex flex-col items-center gap-0.5 py-2.5 min-h-[56px] justify-center text-xs font-medium transition-colors ${
                  isActive ? "text-coral" : "text-ink-soft"
                }`}
              >
                <span className={`text-xl leading-none transition-transform ${isActive ? "scale-110" : ""}`} aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav({ active, onChange }: NavProps) {
  return (
    <nav
      className="hidden md:flex flex-col w-56 shrink-0 gap-1 p-4 sticky top-0 h-screen"
      aria-label="Primary"
    >
      <div className="px-2 py-4">
        <p className="font-display text-xl font-bold text-ink">🌸 Bloom</p>
        <p className="text-xs text-ink-soft mt-0.5">your money companion</p>
      </div>
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-cozy-sm text-sm font-semibold transition-colors ${
              isActive ? "bg-blush/60 text-ink" : "text-ink-soft hover:bg-black/[0.03]"
            }`}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
