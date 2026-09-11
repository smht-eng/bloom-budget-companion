export function formatBaht(amount: number, opts: { decimals?: boolean } = {}): string {
  const rounded = opts.decimals ? amount : Math.round(amount);
  const body = rounded.toLocaleString("en-US", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  });
  return `฿${body}`;
}

export function formatBahtSigned(amount: number): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";
  return `${sign}${formatBaht(Math.abs(amount))}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
