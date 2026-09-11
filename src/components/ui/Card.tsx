import type { HTMLAttributes, ReactNode } from "react";

type Tone = "white" | "blush" | "lavender" | "sage" | "baby-blue" | "butter";

const TONE_BG: Record<Tone, string> = {
  white: "bg-white/90",
  blush: "bg-blush/60",
  lavender: "bg-lavender/50",
  sage: "bg-sage/60",
  "baby-blue": "bg-baby-blue/55",
  butter: "bg-butter/45",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  children: ReactNode;
}

export function Card({ tone = "white", className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-cozy ${TONE_BG[tone]} shadow-soft ring-1 ring-black/[0.03] p-5 sm:p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
