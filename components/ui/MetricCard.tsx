import { cn, changeBg, changeColor, formatChange } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  highlight?: boolean;
}

export default function MetricCard({ label, value, change, highlight }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-card transition-shadow hover:shadow-elevated",
        highlight ? "border-brand-200 ring-1 ring-brand-100" : "border-stone-200"
      )}
    >
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold tracking-tight", highlight ? "text-brand-700" : "text-stone-900")}>
        {value}
      </p>
      {change !== undefined && (
        <span className={cn("mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", changeBg(change))}>
          {formatChange(change)}
        </span>
      )}
    </div>
  );
}

export function MetricChangeRow({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-surface-muted px-4 py-3">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-stone-900">{value}</span>
        <span className={cn("text-sm font-semibold", changeColor(change))}>{formatChange(change)}</span>
      </div>
    </div>
  );
}
