import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import CreateCampaignButton from "@/components/growth/CreateCampaignButton";
import { formatCurrency } from "@/lib/utils";
import { getGrowthDashboardData } from "@/lib/growth/metrics";
import { resolveMarketingStrategy } from "@/lib/growth/aiStrategy";
import { AiSourceBadge } from "@/components/growth/AiSourceBadge";
import type { OpportunityId } from "@/types/growth";

const OPPORTUNITY_IDS: OpportunityId[] = [
  "new_repeat_low",
  "high_value_decline",
  "lunch_growth",
  "arpu_lift",
  "growth_quality",
];

export function generateStaticParams() {
  return OPPORTUNITY_IDS.map((opportunityId) => ({ opportunityId }));
}

export default async function StrategyPage({
  params,
}: {
  params: Promise<{ opportunityId: string }>;
}) {
  const { opportunityId } = await params;
  if (!OPPORTUNITY_IDS.includes(opportunityId as OpportunityId)) notFound();

  const data = getGrowthDashboardData();
  let opportunity = data.opportunities.find((o) => o.id === opportunityId);

  // 策略页允许直接访问全部机会 ID：若规则未命中，用最小占位机会以展示模板
  if (!opportunity) {
    opportunity = {
      id: opportunityId as OpportunityId,
      title: "增长策略",
      severity: "info",
      discovery: ["当前规则未强触发该机会，仍可查看策略模板。"],
      judgment: "用于策略结构演示。",
      targetUsers: "相关目标人群",
      targetUserCount: 0,
      growthGoal: "验证营销策略结构",
      ctaLabel: "生成增长方案",
      evidenceMetrics: {},
    };
  }

  const strategy = await resolveMarketingStrategy(opportunity);
  const f = strategy.forecast;
  const repeatBefore = Number(opportunity.evidenceMetrics.repeatRate ?? 0);

  return (
    <>
      <Header date={data.asOfDate} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-6">
          <Link
            href="/growth/opportunities"
            className="text-sm text-brand-700 hover:underline"
          >
            ← 返回增长机会
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">AI 营销策略</h2>
            <AiSourceBadge source={strategy.source} />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            基于「{opportunity.title}」生成结构化方案：优先调用 DeepSeek，失败自动回退规则引擎
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">营销目标</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {strategy.goal}
              </p>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">目标人群</h3>
              <p className="mt-2 text-sm text-stone-700">
                {strategy.targetAudience}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-900">
                {strategy.targetUserCount.toLocaleString("zh-CN")} 人
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {strategy.userTraits.map((t) => (
                  <li
                    key={t}
                    className="rounded-md bg-surface-muted px-2.5 py-1 text-xs text-stone-700"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">推荐权益</h3>
              <p className="mt-2 text-base font-semibold text-brand-700">
                {strategy.benefit}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {strategy.benefitReason}
              </p>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">推荐渠道</h3>
              <ul className="mt-3 space-y-3">
                {strategy.channels.map((c) => (
                  <li key={c.name} className="text-sm">
                    <span className="font-medium text-stone-900">{c.name}</span>
                    <span className="mt-0.5 block text-stone-600">{c.reason}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg bg-surface-muted px-3 py-2.5">
                <p className="text-xs text-stone-500">推荐发送时间</p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">
                  {strategy.sendTime}
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  {strategy.sendTimeReason}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">AI 营销文案</h3>
              <div className="mt-3 space-y-3">
                {[
                  ["短信", strategy.copySms],
                  ["微信 / 公众号", strategy.copyWechat],
                  ["Push", strategy.copyPush],
                ].map(([label, copy]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-stone-100 bg-surface-muted px-3 py-2.5"
                  >
                    <p className="text-xs font-medium text-stone-500">{label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-brand-200 bg-brand-50/50 p-5 shadow-card">
              <h3 className="text-sm font-semibold text-brand-800">
                为什么推荐？
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {strategy.whyRecommended}
              </p>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-stone-900">预计结果</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["预计触达", f.reach.toLocaleString("zh-CN")],
                  ["预计领取率", `${f.claimRate}%`],
                  ["预计核销率", `${f.redemptionRate}%`],
                  ["预计复购人数", f.repeatUsers.toLocaleString("zh-CN")],
                  ["预计 GMV", formatCurrency(f.gmv)],
                  ["预计营销成本", formatCurrency(f.cost)],
                  ["预计 ROI", String(f.roi)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-stone-500">{k}</dt>
                    <dd className="font-semibold text-stone-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-amber-800">
                {strategy.disclaimer}
              </p>
              <p className="mt-1 text-[11px] text-stone-500">
                ROI = (活动收入 - 营销成本) / 营销成本
              </p>
            </section>

            <CreateCampaignButton
              opportunityId={opportunity.id}
              opportunityTitle={opportunity.title}
              strategy={strategy}
              asOfDate={data.asOfDate}
              repeatRateBefore={repeatBefore}
            />
          </div>
        </div>
      </div>
    </>
  );
}
