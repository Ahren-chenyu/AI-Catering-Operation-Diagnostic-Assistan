"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  campaignRoi,
  loadLocalCampaigns,
  mergeCampaigns,
} from "@/lib/growth/campaignStorage";
import { generateCampaignReview } from "@/lib/growth/campaignReview";
import type { GrowthCampaign } from "@/types/growth";

const statusStyle = {
  准备中: "bg-stone-100 text-stone-700",
  进行中: "bg-sky-50 text-sky-700",
  已结束: "bg-emerald-50 text-emerald-700",
} as const;

export default function CampaignsClient({
  demoCampaigns,
}: {
  demoCampaigns: GrowthCampaign[];
}) {
  const [local, setLocal] = useState<GrowthCampaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLocal(loadLocalCampaigns());
  }, []);

  const campaigns = useMemo(
    () => mergeCampaigns(demoCampaigns, local),
    [demoCampaigns, local]
  );

  useEffect(() => {
    if (!selectedId && campaigns.length > 0) {
      const ended = campaigns.find((c) => c.status === "已结束");
      setSelectedId(ended?.campaignId ?? campaigns[0]!.campaignId);
    }
  }, [campaigns, selectedId]);

  const selected = campaigns.find((c) => c.campaignId === selectedId) ?? null;
  const review = selected ? generateCampaignReview(selected) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-2">
        {campaigns.map((c) => {
          const roi = campaignRoi(c);
          const active = c.campaignId === selectedId;
          return (
            <button
              key={c.campaignId}
              type="button"
              onClick={() => setSelectedId(c.campaignId)}
              className={cn(
                "w-full rounded-xl border bg-white p-4 text-left shadow-card transition-colors",
                active
                  ? "border-brand-300 ring-1 ring-brand-100"
                  : "border-stone-200 hover:border-stone-300"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">
                  {c.campaignName}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    statusStyle[c.status]
                  )}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {c.targetSegment} · {c.targetUsers.toLocaleString("zh-CN")} 人
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-600">
                <span>触达 {c.reach}</span>
                <span>核销 {c.redemption}</span>
                <span>GMV {formatCurrency(c.revenue)}</span>
                <span>ROI {roi}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3">
        {selected && review ? (
          <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-card">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                营销效果复盘
              </p>
              <h3 className="mt-1 text-lg font-semibold text-stone-900">
                {selected.campaignName}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {selected.campaignId} · 权益 {selected.benefit} · 渠道{" "}
                {selected.channels.join(" / ")} · {selected.sendTime}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["目标用户", selected.targetUsers.toLocaleString("zh-CN")],
                ["实际触达", selected.reach.toLocaleString("zh-CN")],
                ["优惠领取", selected.claim.toLocaleString("zh-CN")],
                ["核销", selected.redemption.toLocaleString("zh-CN")],
                ["新增 GMV", formatCurrency(selected.revenue)],
                ["营销成本", formatCurrency(selected.cost)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-stone-100 bg-surface-muted px-3 py-2.5"
                >
                  <p className="text-xs text-stone-500">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-4 py-3">
              <p className="text-sm font-semibold text-brand-800">
                ROI = {review.roi}
              </p>
              <p className="mt-1 text-xs text-brand-700/80">{review.roiFormula}</p>
              {selected.status === "已结束" && (
                <p className="mt-2 text-sm text-stone-700">
                  复购率：活动前 {selected.repeatRateBefore}% → 活动后{" "}
                  {selected.repeatRateAfter}%（
                  {selected.repeatRateAfter - selected.repeatRateBefore >= 0
                    ? "+"
                    : ""}
                  {Math.round(
                    (selected.repeatRateAfter - selected.repeatRateBefore) * 10
                  ) / 10}{" "}
                  个百分点）
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                AI 效果分析
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {review.analysis}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                下一轮建议
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {review.nextSteps}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
            选择左侧活动查看复盘
          </div>
        )}
      </div>
    </div>
  );
}
