/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#f5f3ff",
      "foreground": "#171329",
      "border": "#d8d1ee",
      "card": "#ffffff",
      "cardForeground": "#171329",
      "popover": "#ffffff",
      "popoverForeground": "#171329",
      "primary": "#087e8b",
      "primaryForeground": "#ffffff",
      "secondary": "#e9e4ff",
      "secondaryForeground": "#31254c",
      "muted": "#efedf7",
      "mutedForeground": "#5f5872",
      "accent": "#9c36b4",
      "accentForeground": "#ffffff",
      "destructive": "#b62951",
      "destructiveForeground": "#ffffff",
      "input": "#c6bedc",
      "ring": "#087e8b",
      "chart1": "#087e8b",
      "chart2": "#aa28b9",
      "chart3": "#bf8100",
      "chart4": "#508224",
      "chart5": "#6339b6",
      "sidebar": "#f0edfb",
      "sidebarForeground": "#171329",
      "sidebarBorder": "#d8d1ee",
      "sidebarPrimary": "#087e8b",
      "sidebarPrimaryForeground": "#ffffff",
      "sidebarAccent": "#e7e1f7",
      "sidebarAccentForeground": "#31254c",
      "sidebarRing": "#087e8b"
    },
    "dark": {
      "background": "#080914",
      "foreground": "#f4efff",
      "border": "#423666",
      "card": "#101225",
      "cardForeground": "#f4efff",
      "popover": "#111427",
      "popoverForeground": "#f4efff",
      "primary": "#31eaff",
      "primaryForeground": "#080914",
      "secondary": "#201b38",
      "secondaryForeground": "#eee9ff",
      "muted": "#19182e",
      "mutedForeground": "#aaa8c8",
      "accent": "#ec62ff",
      "accentForeground": "#080914",
      "destructive": "#ff7188",
      "destructiveForeground": "#190915",
      "input": "#41375f",
      "ring": "#31eaff",
      "chart1": "#31eaff",
      "chart2": "#ec62ff",
      "chart3": "#ffdc4a",
      "chart4": "#b7ff55",
      "chart5": "#9d7bff",
      "sidebar": "#0b0d1b",
      "sidebarForeground": "#f4efff",
      "sidebarBorder": "#302b52",
      "sidebarPrimary": "#31eaff",
      "sidebarPrimaryForeground": "#080914",
      "sidebarAccent": "#19162d",
      "sidebarAccentForeground": "#f4efff",
      "sidebarRing": "#31eaff"
    }
  },
  "fontFamily": {
    "sans": [
      "ui-monospace",
      "SFMono-Regular",
      "Cascadia Code",
      "Liberation Mono",
      "monospace"
    ],
    "serif": [
      "ui-monospace",
      "SFMono-Regular",
      "Cascadia Code",
      "Liberation Mono",
      "monospace"
    ],
    "mono": [
      "ui-monospace",
      "SFMono-Regular",
      "Cascadia Code",
      "Liberation Mono",
      "monospace"
    ]
  },
  "radius": "0.2rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
