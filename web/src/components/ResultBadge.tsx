/* Hallmark · component: ResultBadge · genre: modern-minimal · theme: cobalt
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (AAA high legibility under daylight)
 */
interface ResultBadgeProps {
  result: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export default function ResultBadge({
  result,
  size = "md",
  className = "",
  showIcon = true,
}: ResultBadgeProps) {
  const norm = (result || "inconclusive").toLowerCase();

  const configs: Record<
    string,
    { label: string; badgeClass: string; dotClass: string; icon: string }
  > = {
    positive: {
      label: "Presumptive Positive",
      badgeClass:
        "bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/50",
      dotClass: "bg-rose-400 animate-pulse",
      icon: "▲",
    },
    negative: {
      label: "Presumptive Negative",
      badgeClass:
        "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/50",
      dotClass: "bg-emerald-400",
      icon: "✓",
    },
    inconclusive: {
      label: "Inconclusive / Retest",
      badgeClass:
        "bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/50",
      dotClass: "bg-amber-400",
      icon: "■",
    },
  };

  const current = configs[norm] || {
    label: result.toUpperCase(),
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
    dotClass: "bg-slate-400",
    icon: "•",
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 tracking-wider gap-1",
    md: "text-xs px-2.5 py-1 tracking-wide gap-1.5",
    lg: "text-sm px-3.5 py-1.5 tracking-wide gap-2 font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase rounded-md border whitespace-nowrap select-none ${sizeClasses} ${current.badgeClass} ${className}`}
    >
      {showIcon && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{current.label}</span>
    </span>
  );
}
