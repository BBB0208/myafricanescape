import type { ReactElement } from "react";
import type { SceneName } from "@/lib/properties";

/* ============================================================
   Bespoke "Panavision" scene illustrations — flat SVG silhouettes
   standing in for photography, colour-graded to the site palette.
   Rendered wherever the original markup carried a [data-scene].

   The eight gradients live once in <SceneDefs />, mounted in the
   root layout, so every scene can reference them by id.
   ============================================================ */

export function SceneDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0"
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset=".55" stopColor="#E85D2C" />
          <stop offset="1" stopColor="#C6236F" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9E1958" />
          <stop offset=".5" stopColor="#E85D2C" />
          <stop offset="1" stopColor="#F2B705" />
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset=".5" stopColor="#F3742E" />
          <stop offset="1" stopColor="#0B4F4A" />
        </linearGradient>
        <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset=".6" stopColor="#E85D2C" />
          <stop offset="1" stopColor="#241608" />
        </linearGradient>
        <linearGradient id="g5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C6236F" />
          <stop offset=".6" stopColor="#E85D2C" />
          <stop offset="1" stopColor="#12655F" />
        </linearGradient>
        <linearGradient id="g6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset=".55" stopColor="#E85D2C" />
          <stop offset="1" stopColor="#9E1958" />
        </linearGradient>
        <linearGradient id="g7" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B705" />
          <stop offset=".5" stopColor="#12655F" />
          <stop offset="1" stopColor="#062E2B" />
        </linearGradient>
        <linearGradient id="g8" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3742E" />
          <stop offset=".5" stopColor="#C6236F" />
          <stop offset="1" stopColor="#062E2B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SCENES: Record<SceneName, (className?: string) => ReactElement> = {
  skyline: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g1)" />
      <circle cx="300" cy="90" r="58" fill="#F6EFE3" opacity=".85" />
      <g fill="#241608" opacity=".92">
        <rect x="10" y="150" width="34" height="150" />
        <rect x="50" y="110" width="26" height="190" />
        <rect x="82" y="170" width="30" height="130" />
        <rect x="118" y="90" width="22" height="210" />
        <rect x="146" y="140" width="40" height="160" />
        <rect x="192" y="60" width="24" height="240" />
        <rect x="222" y="120" width="30" height="180" />
        <rect x="258" y="180" width="26" height="120" />
        <rect x="290" y="200" width="110" height="100" />
      </g>
    </svg>
  ),
  riad: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g2)" />
      <path d="M0 300 V190 Q200 90 400 190 V300 Z" fill="#241608" opacity=".9" />
      <path d="M150 300 V210 Q200 165 250 210 V300 Z" fill="#F6EFE3" opacity=".18" />
    </svg>
  ),
  coast: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g3)" />
      <circle cx="320" cy="70" r="40" fill="#F6EFE3" opacity=".8" />
      <path d="M0 210 Q100 180 200 210 T400 210 V300 H0 Z" fill="#062E2B" />
      <g stroke="#241608" strokeWidth="6" opacity=".85" fill="none">
        <path d="M60 300 V180 Q40 150 70 120" />
        <path d="M60 180 Q90 165 110 175" />
        <path d="M60 150 Q30 140 15 155" />
      </g>
    </svg>
  ),
  savanna: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g4)" />
      <circle cx="90" cy="80" r="46" fill="#F6EFE3" opacity=".75" />
      <path d="M0 230 Q120 190 220 225 T400 220 V300 H0 Z" fill="#062E2B" opacity=".92" />
      <g stroke="#241608" strokeWidth="5" fill="none" opacity=".8">
        <path d="M300 230 V150" />
        <path d="M300 175 Q260 165 250 140" />
        <path d="M300 165 Q340 155 350 130" />
        <path d="M300 150 Q270 140 262 120" />
      </g>
    </svg>
  ),
  vineyard: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g5)" />
      <g stroke="#241608" strokeWidth="4" opacity=".55">
        <path d="M0 230 L400 190" />
        <path d="M0 250 L400 212" />
        <path d="M0 270 L400 234" />
        <path d="M0 290 L400 256" />
      </g>
      <path d="M40 300 L360 240 V300 Z" fill="#062E2B" opacity=".5" />
    </svg>
  ),
  desert: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g6)" />
      <path d="M0 260 Q100 210 220 250 T400 240 V300 H0 Z" fill="#241608" opacity=".85" />
      <path d="M0 280 Q150 240 280 275 T400 270 V300 H0 Z" fill="#062E2B" opacity=".7" />
    </svg>
  ),
  river: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g7)" />
      <g fill="#241608" opacity=".9">
        <rect x="30" y="140" width="20" height="160" />
        <rect x="60" y="110" width="24" height="190" />
        <rect x="96" y="160" width="18" height="140" />
        <rect x="330" y="120" width="22" height="180" />
        <rect x="360" y="150" width="18" height="150" />
      </g>
      <path d="M0 220 Q200 195 400 225 V300 H0 Z" fill="#F2B705" opacity=".2" />
    </svg>
  ),
  lake: (className) => (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" className={className}>
      <rect width="400" height="300" fill="url(#g8)" />
      <circle cx="200" cy="90" r="44" fill="#F6EFE3" opacity=".8" />
      <path d="M0 240 Q200 210 400 240 V300 H0 Z" fill="#062E2B" />
      <path d="M0 240 Q200 218 400 240" stroke="#F2B705" strokeWidth="3" fill="none" opacity=".5" />
    </svg>
  ),
};

export default function Scene({
  name,
  className,
}: {
  name: SceneName;
  className?: string;
}) {
  return (SCENES[name] ?? SCENES.savanna)(className);
}
