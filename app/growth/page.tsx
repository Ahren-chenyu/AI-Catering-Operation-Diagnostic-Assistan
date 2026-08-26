import Header from "@/components/layout/Header";
import GrowthKpiCard from "@/components/growth/GrowthKpiCard";
import OpportunityCard from "@/components/growth/OpportunityCard";
import SimpleLineChart, { ChartCard } from "@/components/growth/SimpleLineChart";
import ButtonLink from "@/components/ui/ButtonLink";
import { getGrowthDashboardData } from "@/lib/growth/metrics";

export default function GrowthPage() {
  const data = getGrowthDashboardData();

  return (
    <>
      <Header date={data.asOfDate} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">用户增长中心</h2>
            <p className="mt-1 text-sm text-stone-500">
              统一 Mock 数据集 · 数据截至 {data.asOfDate} · 经营数据 → 用户分析 →
              增长机会
            </p>
          </div>
          <ButtonLink href="/growth/opportunities">查看全部增长机会</ButtonLink>
        </div>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            核心增长 KPI
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.kpis.map((kpi) => (
              <GrowthKpiCard key={kpi.key} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <ChartCard title="新增用户趋势" subtitle="最近 30 天每日首购用户">
            <SimpleLineChart
              data={data.newUserTrend.map((p) => ({
                label: p.date.slice(5),
                value: p.value,
              }))}
            />
          </ChartCard>
          <ChartCard title="活跃用户趋势" subtitle="最近 30 天每日活跃用户">
            <SimpleLineChart
              data={data.activeUserTrend.map((p) => ({
                label: p.date.slice(5),
                value: p.value,
              }))}
              color="#b84114"
            />
          </ChartCard>
          <ChartCard title="复购率趋势" subtitle="最近 6 个月新客复购率">
            <SimpleLineChart
              data={data.repeatRateTrend.map((p) => ({
                label: p.month,
                value: p.value,
              }))}
              valueSuffix="%"
            />
          </ChartCard>
          <ChartCard title="ARPU 趋势" subtitle="最近 6 个月人均贡献">
            <SimpleLineChart
              data={data.arpuTrend.map((p) => ({
                label: p.month,
                value: p.value,
              }))}
              currency
              color="#933518"
            />
          </ChartCard>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
              AI 增长机会预览
            </h3>
            <p className="text-sm text-stone-500">
              今日发现 {data.opportunities.length} 个机会
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.opportunities.slice(0, 3).map((op) => (
              <OpportunityCard key={op.id} opportunity={op} compact />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6 shadow-card">
            <div>
              <p className="text-sm font-medium text-brand-600">下一步</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">
                进入 RFM 用户分层，定位可运营人群
              </p>
            </div>
            <ButtonLink href="/growth/segments">查看用户分层</ButtonLink>
          </div>
        </section>
      </div>
    </>
  );
}
