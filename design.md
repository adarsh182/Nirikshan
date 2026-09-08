# Design — Nirikshan

Locked design system for the Nirikshan Field Drug Test Companion. Every page and component
in this application reads this specification before emitting code. Do not invent ad-hoc tokens.

## System
- Genre · modern-minimal (Tactical Forensic Field Terminal)
- Macrostructure Family ·
  - App & Dashboard Pages: Workbench (tactical, high-density data anchors, instrument panel)
  - Field Capture: HUD Viewfinder (ergonomic thumb shutter, camera switch, reagent selector, live sensor pill)
  - Evidence & Dossier: Dossier Casebook (cryptographic chain of custody, chemical color swatch comparison)
- Theme · Cobalt / Canonical Light Mode (High-Contrast Daylight Field Interface)
- Axes · Cool Engineered Near-White Paper (`oklch(98.5% 0.004 250)`) / Grotesk-sans (`Space Grotesk`) / Electric Cobalt Signal (`oklch(58% 0.20 256)`)

## Tokens (canonical · `index.css` is the source of truth)
```css
:root {
  /* Paper & Grounds (Daylight Cool-White) */
  --color-paper:       oklch(98.5% 0.004 250); /* #f8fafc - Cool near-white ground */
  --color-paper-2:     oklch(100% 0 0);        /* #ffffff - Elevated card surface */
  --color-paper-3:     oklch(96% 0.008 250);   /* #f1f5f9 - Interactive hover surface */
  --color-paper-glass: oklch(100% 0 0 / 0.92); /* Blurred header/dock */

  /* Ink & Typography (Charcoal High-Contrast) */
  --color-ink:         oklch(24% 0.02 258);    /* #0f172a - Deep charcoal primary text */
  --color-ink-2:       oklch(45% 0.02 258);    /* #475569 - Secondary technical metadata */
  --color-ink-muted:   oklch(62% 0.015 258);   /* #64748b - Tertiary labels / timestamps */

  /* Hairline Rules */
  --color-rule:        oklch(90% 0.01 250);    /* #e2e8f0 - Crisp 1px structural borders */
  --color-rule-strong: oklch(80% 0.02 250);    /* #cbd5e1 - Active borders */

  /* Signals & Accents (< 5% viewport footprint) */
  --color-accent:      oklch(58% 0.20 256);    /* Electric Cobalt Blue */
  --color-accent-ink:  oklch(100% 0 0);
  --color-focus:       oklch(60% 0.20 256);

  /* Forensic Status Indicators (Daylight Calibrated) */
  --color-positive:    oklch(55% 0.22 25);     /* Presumptive Positive (Crimson) */
  --color-negative:    oklch(58% 0.18 148);    /* Presumptive Negative (Jade/Emerald) */
  --color-inconclusive:oklch(65% 0.16 65);     /* Inconclusive (Caution Ochre) */

  /* Typography */
  --font-display: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    "JetBrains Mono", "SF Mono", monospace;

  /* 4-point Spacing Scale */
  --space-3xs: 0.25rem;  /* 4px */
  --space-2xs: 0.5rem;   /* 8px */
  --space-xs:  0.75rem;  /* 12px */
  --space-sm:  1rem;      /* 16px */
  --space-md:  1.5rem;    /* 24px */
  --space-lg:  2rem;      /* 32px */
  --space-xl:  3rem;      /* 48px */
  --space-2xl: 4.5rem;    /* 72px */

  /* Technical Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Motion & Duration */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 180ms;
}
```

## Mobile-First Rules (Non-Negotiable)
1. **Touch Targets**: Minimum `48px` touch target height and width on all interactive buttons, tabs, and links.
2. **Single-Line Affordances**: Primary buttons, nav tabs, and status badges never wrap (`white-space: nowrap`).
3. **No Horizontal Page Scroll**: Root carriers `overflow-x: clip` on both `html` and `body`.
4. **Thumb-Zone Navigation**: Bottom dock on mobile phones (`< 768px`) for immediate one-handed control.
5. **Daylight Outdoor Visibility**: Maximum contrast ratio (AAA) with clean charcoal text on cool-white paper.
