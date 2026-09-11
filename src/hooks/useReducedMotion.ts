import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";

function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Combines the OS-level preference with the in-app "reduce motion" setting. */
export function useReducedMotion(): boolean {
  const override = useStore((s) => s.settings.reducedMotionOverride);
  const [system, setSystem] = useState(systemPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setSystem(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return override || system;
}
