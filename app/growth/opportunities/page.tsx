import Header from "@/components/layout/Header";
import OpportunityCard from "@/components/growth/OpportunityCard";
import { getGrowthDashboardData } from "@/lib/growth/metrics";

export default function OpportunitiesPage() {
  const data = getGrowthDashboardData();

  return (
    <>
      <Header date={data.asOfDate} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">AI 增长机会</h2>
          <p className="mt-1 text-sm text-stone-500">
            规则引擎主动扫描统一增长数据集，今日发现{" "}
            <span className="font-semibold text-stone-800">
              {data.opportunities.length}
            </span>{" "}
            个可行动机会
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
            识别逻辑
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            新客复购走弱、高价值活跃下降、午餐订单连续走弱、ARPU 下行且活跃稳定、拉新加速但留存走弱
            —— 命中规则后输出「发现 → 判断 → 目标人群 → 增长目标」，并与 KPI / 分层数据同源。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.opportunities.map((op) => (
            <OpportunityCard key={op.id} opportunity={op} />
          ))}
        </div>
      </div>
    </>
  );
}
