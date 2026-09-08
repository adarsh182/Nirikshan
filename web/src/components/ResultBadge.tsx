const colors: Record<string, string> = {
  positive: "bg-red-500/20 text-red-300 border-red-500/40",
  negative: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  inconclusive: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export default function ResultBadge({ result }: { result: string }) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colors[result] || "bg-slate-500/20 text-slate-300"}`}
    >
      {result}
    </span>
  );
}
