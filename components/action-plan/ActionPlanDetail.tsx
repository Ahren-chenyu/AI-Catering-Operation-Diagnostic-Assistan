import type { ActionPlan } from "@/types";

interface ActionPlanDetailProps {
  plan: ActionPlan;
}

export default function ActionPlanDetail({ plan }: ActionPlanDetailProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">AI 建议方案</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">{plan.title}</h2>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            可执行
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoBlock title="核心问题" content={plan.coreProblem} variant="problem" />
        <InfoBlock title="建议原因" content={plan.reason} variant="reason" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatBlock label="执行周期" value={plan.duration} />
        <StatBlock
          label="AI 测算预算"
          value={plan.budget}
          note={plan.budgetNote}
        />
        <StatBlock label="目标" value={plan.target} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricList title="核心指标" items={plan.coreMetrics} color="brand" />
        <MetricList title="复盘指标" items={plan.reviewMetrics} color="stone" />
      </div>
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
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-stone-900">{value}</p>
      {note && (
        <p className="mt-1 text-xs text-amber-600">{note}</p>
      )}
    </div>
  );
}

function MetricList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "brand" | "stone";
}) {
  const dotColor = color === "brand" ? "bg-brand-500" : "bg-stone-400";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-stone-700">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
