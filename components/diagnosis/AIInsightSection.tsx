import AIInsightError from "@/components/diagnosis/AIInsightError";
import AIInsightPanel from "@/components/diagnosis/AIInsightPanel";
import type { AIInsightResult } from "@/types";

interface AIInsightSectionProps {
  aiInsight: AIInsightResult | null | undefined;
}

/** 异步 Server Component：展示当天已持久化的 DeepSeek 解读，不重复调用 API */
export async function AIInsightSection({ aiInsight }: AIInsightSectionProps) {
  if (!aiInsight) {
    return <AIInsightError />;
  }

  return <AIInsightPanel insight={aiInsight} />;
}
