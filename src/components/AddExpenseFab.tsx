interface Props {
  onClick: () => void;
}

export function AddExpenseFab({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed z-30 right-5 bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-8 md:right-8 flex items-center gap-2 rounded-full bg-coral text-white pl-4 pr-5 py-3.5 shadow-lift hover:brightness-105 active:scale-95 transition-all font-semibold text-sm"
    >
      <span className="text-lg leading-none" aria-hidden>
        +
      </span>
      Add expense
    </button>
  );
}
