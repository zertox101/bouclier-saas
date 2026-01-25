type SeverityTone = "critical" | "high" | "medium" | "low";

const toneStyles: Record<SeverityTone, string> = {
  critical: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  high: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  medium: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
  low: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
};

type SeverityItem = {
  label: string;
  count: number;
  tone: SeverityTone;
};

type SeverityStatsProps = {
  items: SeverityItem[];
  compact?: boolean;
};

export default function SeverityStats({ items, compact = false }: SeverityStatsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 ${toneStyles[item.tone]}`}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">
            {item.label}
          </span>
          <span className="font-semibold">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
