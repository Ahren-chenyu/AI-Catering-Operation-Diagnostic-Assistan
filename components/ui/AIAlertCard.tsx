import type { AIInsight } from "@/types";
import { cn } from "@/lib/utils";

const severityStyles = {
  critical: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

const severityBadge = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

const severityLabel = {
  critical: "异常",
  warning: "关注",
  info: "提示",
};

interface AIAlertCardProps {
  insight: AIInsight;
  showEvidence?: boolean;
}

export default function AIAlertCard({ insight, showEvidence = true }: AIAlertCardProps) {
  return (
    <div className={cn("rounded-xl border p-5", severityStyles[insight.severity])}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">{insight.title}</h3>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", severityBadge[insight.severity])}>
              {severityLabel[insight.severity]}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{insight.description}</p>
          {showEvidence && insight.evidence.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {insight.evidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
