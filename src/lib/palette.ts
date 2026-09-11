/**
 * Static Tailwind class + hex lookups for the pastel tokens used by dynamic
 * category colors. Written out literally so Tailwind's content scanner can
 * find every class name at build time.
 */
export interface PaletteToken {
  bg: string;
  bgDeep: string;
  ring: string;
  hex: string;
  hexDeep: string;
}

export const PALETTE: Record<string, PaletteToken> = {
  blush: { bg: "bg-blush", bgDeep: "bg-blush-deep", ring: "ring-blush-deep", hex: "#F8DDE5", hexDeep: "#F0B9CB" },
  lavender: {
    bg: "bg-lavender",
    bgDeep: "bg-lavender-deep",
    ring: "ring-lavender-deep",
    hex: "#E7DDF7",
    hexDeep: "#C9B6EC",
  },
  sage: { bg: "bg-sage", bgDeep: "bg-sage-deep", ring: "ring-sage-deep", hex: "#DCEBDD", hexDeep: "#A9CFAE" },
  "baby-blue": {
    bg: "bg-baby-blue",
    bgDeep: "bg-blue-deep",
    ring: "ring-blue-deep",
    hex: "#DCECF7",
    hexDeep: "#AFD3EC",
  },
  butter: { bg: "bg-butter", bgDeep: "bg-butter-deep", ring: "ring-butter-deep", hex: "#FFF0B8", hexDeep: "#F5DD7E" },
  coral: { bg: "bg-coral", bgDeep: "bg-coral", ring: "ring-coral", hex: "#E9A6A6", hexDeep: "#E9A6A6" },
};

export function paletteFor(color: string): PaletteToken {
  return PALETTE[color] ?? PALETTE.blush;
}

export const PALETTE_ORDER = ["blush", "lavender", "sage", "baby-blue", "butter", "coral"];
