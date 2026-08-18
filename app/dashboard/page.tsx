import Header from "@/components/layout/Header";
import AIAlertCard from "@/components/ui/AIAlertCard";
import ButtonLink from "@/components/ui/ButtonLink";
import MetricCard from "@/components/ui/MetricCard";
import { fetchDashboardPageData } from "@/lib/api/serverFetch";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const { data } = await fetchDashboardPageData();
  const { store, metrics, revenueStatus, insights, status } = data;

  return (
    <>
      <Header store={store} date={metrics.date} />
      <div className="px-8 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">经营诊断助手</h2>
          <p className="mt-1 text-sm text-stone-500">
            AI 已自动检查今日经营数据，以下是诊断概览
          </p>
        </div>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            今日经营概览
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="今日营业额"
              value={formatCurrency(metrics.revenue)}
              change={metrics.revenueChange}
              highlight
            />
            <MetricCard
              label="订单量"
              value={`${metrics.orders.toLocaleString()} 单`}
              change={metrics.ordersChange}
            />
            <MetricCard
              label="客单价"
              value={formatCurrency(metrics.averageOrderValue)}
              change={metrics.averageOrderValueChange}
            />
            <MetricCard
              label="新客量"
              value={`${metrics.newCustomers} 人`}
              change={metrics.newCustomersChange}
            />
            <MetricCard
              label="老客量"
              value={`${metrics.returningCustomers} 人`}
              change={metrics.returningCustomersChange}
            />
            <MetricCard
              label="历史同期均值"
              value={formatCurrency(revenueStatus.historicalAverage)}
            />
          </div>
        </section>

        <section className="mt-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            AI 异常提醒
          </h3>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <AIAlertCard key={i} insight={insight} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-6 shadow-card">
            <div>
              <p className="text-sm font-medium text-brand-600">下一步</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">
                {status === "anomaly"
                  ? "查看 AI 完整诊断，了解营业额异常原因"
                  : "查看 AI 完整诊断，了解当前经营状态"}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                系统将展示分层诊断逻辑与数据证据
              </p>
            </div>
            <ButtonLink href="/diagnosis">查看 AI 诊断</ButtonLink>
          </div>
        </section>
      </div>
    </>
  );
}
