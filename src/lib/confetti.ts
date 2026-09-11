import confetti from "canvas-confetti";

const PASTEL_COLORS = ["#F8DDE5", "#E7DDF7", "#DCEBDD", "#DCECF7", "#FFF0B8", "#E9A6A6"];

export function fireConfetti() {
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors: PASTEL_COLORS,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors: PASTEL_COLORS,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 60,
    spread: 90,
    origin: { y: 0.5 },
    colors: PASTEL_COLORS,
    startVelocity: 35,
    scalar: 1,
    disableForReducedMotion: true,
  });
}
