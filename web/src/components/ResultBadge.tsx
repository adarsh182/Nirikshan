/* Hallmark · component: ResultBadge · genre: modern-minimal · theme: cobalt (canonical light)
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (AAA high legibility under outdoor daylight)
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
        "bg-rose-50 text-rose-700 border-rose-200 shadow-xs",
      dotClass: "bg-rose-500 animate-pulse",
      icon: "▲",
    },
    negative: {
      label: "Presumptive Negative",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs",
      dotClass: "bg-emerald-500",
      icon: "✓",
    },
    inconclusive: {
      label: "Inconclusive / Retest",
      badgeClass:
        "bg-amber-50 text-amber-800 border-amber-200 shadow-xs",
      dotClass: "bg-amber-500",
      icon: "■",
    },
  };

  const current = configs[norm] || {
    label: result.toUpperCase(),
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-500",
    icon: "•",
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 tracking-wider gap-1",
    md: "text-xs px-2.5 py-1 tracking-wide gap-1.5",
    lg: "text-sm px-3.5 py-1.5 tracking-wide gap-2 font-bold",
  }[size];

  return (
    <span
      role="status"
      aria-label={`Test outcome: ${current.label}`}
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
