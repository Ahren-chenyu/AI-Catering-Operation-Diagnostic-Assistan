import type { ActionPlanViewModel } from "@/types";

interface ActionPlanDetailProps {
  view: ActionPlanViewModel;
}

export default function ActionPlanDetail({ view }: ActionPlanDetailProps) {
  const sourceLabel =
    view.source === "deepseek"
      ? "DeepSeek AI 建议"
      : "规则引擎 fallback";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-500">AI 推荐行动</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">{view.title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            {sourceLabel}
          </span>
        </div>
      </div>

      <InfoBlock
        title="目标"
        content={view.coreProblem}
        variant="problem"
      />

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
        <h3 className="text-sm font-semibold text-stone-900">执行步骤</h3>
        <ul className="mt-3 space-y-2.5">
          {view.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatBlock label="执行周期" value={view.duration} plainValue />
        <StatBlock
          label="AI 测算预算"
          value={view.budget}
          note={view.budgetNote}
          plainValue
        />
        <StatBlock
          label="目标指标"
          value={view.targetMetric}
          note={view.targetNote}
          plainValue
        />
      </div>

      <MetricList title="复盘指标" items={view.reviewMetrics} />
    </div>
  );
}

function InfoBlock({
  title,
  content,
  variant,
}: {
  title: string;
  content: string;
  variant: "problem" | "reason";
}) {
  const borderColor = variant === "problem" ? "border-red-200" : "border-blue-200";
  const bgColor = variant === "problem" ? "bg-red-50/50" : "bg-blue-50/50";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5`}>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{content}</p>
    </div>
  );
}

function StatBlock({
  label,
  value,
  note,
  plainValue,
}: {
  label: string;
  value: string;
  note?: string;
  plainValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
      <p
        className={
          plainValue
            ? "text-sm font-semibold text-stone-900"
            : "text-sm font-medium text-stone-500"
        }
      >
        {label}
      </p>
      <p
        className={
          plainValue
            ? "mt-2 text-sm font-normal text-stone-900"
            : "mt-2 text-xl font-bold text-stone-900"
        }
      >
        {value}
      </p>
      {note && (
        <p className="mt-1 text-xs font-medium text-amber-600">{note}</p>
      )}
    </div>
  );
}

function MetricList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-stone-700">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
