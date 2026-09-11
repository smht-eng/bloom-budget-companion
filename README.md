# 🌸 Bloom — Budget Companion

A cozy, encouraging personal budget tracker built around a fixed monthly income, automatic 30/20/50 allocation, daily spending guides, streaks, and a savings garden that grows with good habits.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (pastel design tokens in `src/index.css`)
- Zustand (state + `localStorage` persistence)
- Recharts (category donut + spending trend)
- Framer Motion (micro-animations, reduced-motion aware)
- canvas-confetti (goal celebrations)

## Getting started

```bash
npm install
npm run dev
```

## Budget logic

All budget figures are derived from `monthlyIncome` and the savings / fixed-cost / spending percentages — nothing is hardcoded. See [`src/lib/budget.ts`](src/lib/budget.ts) for the allocation, daily-guide, and savings-progress formulas, and [`src/store/useStore.ts`](src/store/useStore.ts) for streak and month-rollover handling (day-length- and leap-year-safe via `date-fns`).

## Data

Everything is stored locally in the browser (`localStorage`) under the `bloom-budget-store` key. Use Settings → Data to load a small sample dataset or reset everything.
