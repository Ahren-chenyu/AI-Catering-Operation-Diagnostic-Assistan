import Header from "@/components/layout/Header";
import ActionPlanDetail from "@/components/action-plan/ActionPlanDetail";
import ButtonLink from "@/components/ui/ButtonLink";
import { fetchActionPlanPageData } from "@/lib/api/serverFetch";
import { getDefaultQueryDate } from "@/lib/services/businessContextService";

export default async function ActionPlanPage() {
  const { data } = await fetchActionPlanPageData();
  const { store, plan } = data;

  return (
    <>
      <Header store={store} date={getDefaultQueryDate()} />
      <div className="px-8 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">AI 行动计划</h2>
          <p className="mt-1 text-sm text-stone-500">
            回答：现在应该怎么办？以下建议均基于诊断结果生成
          </p>
        </div>

        <ActionPlanDetail plan={plan} />

        <section className="mt-8">
          <div className="rounded-xl border border-stone-200 bg-surface-muted p-6">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-stone-900">关于预算与预测</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  所有预算和目标数字均为 AI 测算值，基于当前门店历史数据和行业经验模型估算，不代表真实投放结果。执行后请通过复盘指标验证效果。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex gap-3">
          <ButtonLink href="/diagnosis" variant="secondary">
            返回诊断
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            返回驾驶舱
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
