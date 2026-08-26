import Header from "@/components/layout/Header";
import SegmentTable from "@/components/growth/SegmentTable";
import ButtonLink from "@/components/ui/ButtonLink";
import { getGrowthDashboardData } from "@/lib/growth/metrics";

export default function GrowthSegmentsPage() {
  const data = getGrowthDashboardData();

  return (
    <>
      <Header date={data.asOfDate} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">用户分层</h2>
            <p className="mt-1 text-sm text-stone-500">
              基于 RFM（Recency / Frequency / Monetary）从统一用户数据集派生分层
            </p>
          </div>
          <ButtonLink href="/growth/opportunities" variant="secondary">
            查看增长机会
          </ButtonLink>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-card">
            <p className="text-xs font-medium text-stone-500">R · Recency</p>
            <p className="mt-1 text-sm text-stone-700">最近一次消费距今天数</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-card">
            <p className="text-xs font-medium text-stone-500">F · Frequency</p>
            <p className="mt-1 text-sm text-stone-700">历史消费次数</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-card">
            <p className="text-xs font-medium text-stone-500">M · Monetary</p>
            <p className="mt-1 text-sm text-stone-700">累计消费金额</p>
          </div>
        </div>

        <SegmentTable segments={data.segments} />

        <p className="mt-4 text-xs text-stone-500">
          点击用户群名称进入明细；策略建议与分层状态均由同一数据集计算，保证与增长驾驶舱一致。
        </p>
      </div>
    </>
  );
}
