import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import type { SegmentSummary } from "@/types/growth";

const statusStyle = {
  健康: "bg-emerald-50 text-emerald-700",
  关注: "bg-amber-50 text-amber-800",
  风险: "bg-red-50 text-red-700",
} as const;

export default function SegmentTable({
  segments,
}: {
  segments: SegmentSummary[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-surface-muted text-xs font-semibold uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-4 py-3">用户群</th>
            <th className="px-4 py-3">用户数量</th>
            <th className="px-4 py-3">占比</th>
            <th className="px-4 py-3">ARPU</th>
            <th className="px-4 py-3">复购率</th>
            <th className="px-4 py-3">状态</th>
            <th className="px-4 py-3">推荐动作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {segments.map((s) => (
            <tr key={s.id} className="hover:bg-stone-50/80">
              <td className="px-4 py-3">
                <Link
                  href={`/growth/segments/${s.id}`}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  {s.name}
                </Link>
                <p className="mt-0.5 max-w-xs text-xs text-stone-500">
                  {s.description}
                </p>
              </td>
              <td className="px-4 py-3 font-medium text-stone-900">
                {s.userCount.toLocaleString("zh-CN")}
              </td>
              <td className="px-4 py-3 text-stone-700">{s.share}%</td>
              <td className="px-4 py-3 text-stone-700">
                {formatCurrency(s.arpu)}
              </td>
              <td className="px-4 py-3 text-stone-700">{s.repeatRate}%</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                    statusStyle[s.status]
                  )}
                >
                  {s.status}
                </span>
              </td>
              <td className="px-4 py-3 text-stone-600">{s.recommendedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
