import "server-only";

import { buildActionPlanView } from "@/lib/ai/buildActionPlanView";
import type {
  ActionPlanViewModel,
  AIInsightResult,
  DiagnosisContext,
  DiagnosisResult,
} from "@/types";

/**
 * 优先使用当天已持久化的 DeepSeek AIInsight；无快照结果时回退到规则引擎 ActionPlan。
 */
export async function resolveActionPlanView(
  diagnosis: DiagnosisResult,
  context?: DiagnosisContext,
  aiInsight?: AIInsightResult | null
): Promise<ActionPlanViewModel> {
  return buildActionPlanView(diagnosis, context, aiInsight);
}
