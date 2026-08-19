import type { DiagnosisInference, EvidenceItem } from "@/types";
import { changeBg, formatChange } from "@/lib/utils";

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
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${sourceStyle[item.source]}`}
        >
          {sourceLabel[item.source]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-stone-900">{item.value}</span>
        {item.change !== undefined && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${changeBg(item.change)}`}
          >
            {formatChange(item.change)}
          </span>
        )}
      </div>
    </div>
  );
}

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <EvidenceRow key={i} item={item} />
      ))}
    </div>
  );
}

export function InferenceList({ items }: { items: DiagnosisInference[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-stone-500">当前数据未触发 AI 推断，仅展示已知事实。</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-blue-200 bg-blue-50/40 p-4"
        >
          <p className="text-sm font-semibold leading-relaxed text-stone-900">
            {item.text}
          </p>
          {item.evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              {item.evidence.map((evidence, j) => (
                <EvidenceRow key={j} item={evidence} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
