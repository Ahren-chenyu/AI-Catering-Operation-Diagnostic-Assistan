import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GrowthOpportunity } from "@/types/growth";

const severityStyle = {
  critical: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
} as const;

const severityLabel = {
  critical: "紧急",
  warning: "关注",
  info: "机会",
} as const;

export default function OpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: GrowthOpportunity;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-card",
        opportunity.severity === "critical" && "border-red-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-stone-900">
          {opportunity.title}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            severityStyle[opportunity.severity]
          )}
        >
          {severityLabel[opportunity.severity]}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
          发现
        </p>
        <ul className="space-y-1">
          {(compact
            ? opportunity.discovery.slice(0, 2)
            : opportunity.discovery
          ).map((line, i) => (
            <li key={i} className="text-sm leading-relaxed text-stone-600">
              {line}
            </li>
          ))}
        </ul>
      </div>

      {!compact && (
        <>
          <div className="mt-4 rounded-lg bg-surface-muted px-3 py-2.5">
            <p className="text-xs font-medium text-stone-500">判断</p>
            <p className="mt-1 text-sm text-stone-800">{opportunity.judgment}</p>
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-stone-500">目标用户</p>
              <p className="mt-0.5 font-medium text-stone-800">
                {opportunity.targetUsers}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">目标人数</p>
              <p className="mt-0.5 font-medium text-stone-800">
                {opportunity.targetUserCount.toLocaleString("zh-CN")} 人
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-600">
            <span className="font-medium text-stone-800">增长目标：</span>
            {opportunity.growthGoal}
          </p>
        </>
      )}

      <div className="mt-auto pt-4">
        <Link
          href={`/growth/strategy/${opportunity.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          {opportunity.ctaLabel}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
