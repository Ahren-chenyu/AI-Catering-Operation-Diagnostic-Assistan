import { cn, changeBg, formatChange } from "@/lib/utils";
import type { GrowthKpi } from "@/types/growth";

export default function GrowthKpiCard({ kpi }: { kpi: GrowthKpi }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-card",
        kpi.isAnomaly
          ? "border-red-200 ring-1 ring-red-100"
          : "border-stone-200"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-stone-500">{kpi.label}</p>
        {kpi.isAnomaly && (
          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
            异常
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xl font-bold tracking-tight text-stone-900">
        {kpi.displayValue}
      </p>
      <span
        className={cn(
          "mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
          changeBg(kpi.change)
        )}
      >
        环比 {formatChange(kpi.change)}
      </span>
      <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
        {kpi.explanation}
      </p>
    </div>
  );
}
