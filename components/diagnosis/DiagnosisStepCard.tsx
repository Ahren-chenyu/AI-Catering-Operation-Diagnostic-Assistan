import type { DiagnosisStep, EvidenceItem } from "@/types";
import { changeColor, formatChange } from "@/lib/utils";

const sourceLabel = {
  known: "已知事实",
  inferred: "AI 推断",
  unknown: "无法判断",
};

const sourceStyle = {
  known: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inferred: "bg-blue-50 text-blue-700 ring-blue-200",
  unknown: "bg-stone-100 text-stone-600 ring-stone-200",
};

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-stone-600">{item.label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${sourceStyle[item.source]}`}>
          {sourceLabel[item.source]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-stone-900">{item.value}</span>
        {item.change !== undefined && (
          <span className={`text-sm font-semibold ${changeColor(item.change)}`}>
            {formatChange(item.change)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DiagnosisStepCard({ step }: { step: DiagnosisStep }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-card">
      <div className="border-b border-stone-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {step.level}
          </span>
          <h3 className="font-semibold text-stone-900">{step.title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-stone-700">{step.conclusion}</p>
      </div>
      <div className="space-y-2 p-4">
        {step.evidence.map((item, i) => (
          <EvidenceRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
