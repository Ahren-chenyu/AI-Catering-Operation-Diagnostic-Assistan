import type { AIInsightResult } from "@/types";

interface AIInsightPanelProps {
  insight: AIInsightResult;
}

export default function AIInsightPanel({ insight }: AIInsightPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          AI 总结
        </p>
        <p className="mt-2 text-base font-semibold leading-relaxed text-stone-900">
          {insight.summary}
        </p>
      </div>

      <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          AI 为什么这样判断
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          {insight.reasoning}
        </p>
      </div>
    </div>
  );
}
