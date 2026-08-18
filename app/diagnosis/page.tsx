import Header from "@/components/layout/Header";
import DiagnosisStepCard from "@/components/diagnosis/DiagnosisStepCard";
import { EvidenceList, InferenceList } from "@/components/diagnosis/DiagnosisEvidence";
import AIAlertCard from "@/components/ui/AIAlertCard";
import ButtonLink from "@/components/ui/ButtonLink";
import { MetricChangeRow } from "@/components/ui/MetricCard";
import { fetchDiagnosisPageData } from "@/lib/api/serverFetch";
import { formatCurrency } from "@/lib/utils";

export default async function DiagnosisPage() {
  const { data } = await fetchDiagnosisPageData();
  const { store, metrics, diagnosis } = data;

  const allEvidence = [
    ...diagnosis.facts,
    ...diagnosis.inferences.flatMap((item) => item.evidence),
  ];

  return (
    <>
      <Header store={store} date={metrics.date} />
      <div className="px-8 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">AI 经营诊断</h2>
          <p className="mt-1 text-sm text-stone-500">
            回答：为什么营业额下降？所有判断均附带数据证据
          </p>
        </div>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            核心指标变化
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <MetricChangeRow
              label="营业额变化"
              value={formatCurrency(metrics.revenue)}
              change={metrics.revenueChange}
            />
            <MetricChangeRow
              label="订单量变化"
              value={`${metrics.orders} 单`}
              change={metrics.ordersChange}
            />
            <MetricChangeRow
              label="客单价变化"
              value={formatCurrency(metrics.averageOrderValue)}
              change={metrics.averageOrderValueChange}
            />
            <MetricChangeRow
              label="新客变化"
              value={`${metrics.newCustomers} 人`}
              change={metrics.newCustomersChange}
            />
            <MetricChangeRow
              label="老客变化"
              value={`${metrics.returningCustomers} 人`}
              change={metrics.returningCustomersChange}
            />
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            当前问题
          </h3>
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
            <p className="text-base font-semibold leading-relaxed text-stone-900">
              {diagnosis.currentProblem}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            诊断结论
          </h3>
          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-600">综合诊断结论</p>
                <p className="mt-2 text-base font-semibold leading-relaxed text-stone-900">
                  {diagnosis.summary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            数据证据
          </h3>
          <EvidenceList items={allEvidence} />
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            已知事实
          </h3>
          <EvidenceList items={diagnosis.facts} />
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            AI 推断
          </h3>
          <InferenceList items={diagnosis.inferences} />
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            诊断逻辑
          </h3>
          <div className="space-y-4">
            {diagnosis.steps.map((step) => (
              <DiagnosisStepCard key={step.level} step={step} />
            ))}
          </div>
        </section>

        {diagnosis.unknownFactors.length > 0 && (
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
              当前无法判断
            </h3>
            <div className="space-y-3">
              {diagnosis.unknownFactors.map((factor, i) => (
                <AIAlertCard
                  key={i}
                  insight={{
                    type: "unknown",
                    title: "数据缺失",
                    description: factor,
                    evidence: [],
                    severity: "info",
                  }}
                  showEvidence={false}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-6 shadow-card">
            <div>
              <p className="text-sm font-medium text-stone-500">下一步</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">
                查看 AI 生成的具体行动计划
              </p>
            </div>
            <ButtonLink href="/action-plan">查看行动计划</ButtonLink>
          </div>
        </section>
      </div>
    </>
  );
}
