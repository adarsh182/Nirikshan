export const Colors = {
  // Backgrounds
  background: "#090d16",
  backgroundSecondary: "#0f172a",
  card: "#131e33",
  cardBorder: "rgba(51, 65, 85, 0.7)",
  cardBorderHover: "rgba(16, 185, 129, 0.5)",
  glass: "rgba(19, 30, 51, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.08)",

  // Emerald primary brand
  primary: "#10b981",
  primaryHover: "#059669",
  primaryDark: "#064e3b",
  primaryGlow: "rgba(16, 185, 129, 0.25)",
  primaryLight: "#a7f3d0",

  // Result statuses
  positive: "#ef4444",
  positiveLight: "rgba(239, 68, 68, 0.15)",
  positiveBorder: "rgba(239, 68, 68, 0.4)",

  negative: "#10b981",
  negativeLight: "rgba(16, 185, 129, 0.15)",
  negativeBorder: "rgba(16, 185, 129, 0.4)",

  inconclusive: "#f59e0b",
  inconclusiveLight: "rgba(245, 158, 11, 0.15)",
  inconclusiveBorder: "rgba(245, 158, 11, 0.4)",

  // Text
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textInverse: "#0f172a",

  // Accents
  accentBlue: "#38bdf8",
  accentIndigo: "#6366f1",
  accentPurple: "#a855f7",

  // Borders & Dividers
  border: "#1e293b",
  borderLight: "#334155",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Typography = {
  header: {
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  body: {
    fontSize: 15,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  code: {
    fontSize: 12,
    fontFamily: "monospace",
    color: Colors.accentBlue,
  },
};
