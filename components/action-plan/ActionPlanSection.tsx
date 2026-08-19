import { resolveActionPlanView } from "@/lib/ai/resolveActionPlanView";
import ActionPlanDetail from "@/components/action-plan/ActionPlanDetail";
import type { DiagnosisContext, DiagnosisResult, AIInsightResult } from "@/types";

interface ActionPlanSectionProps {
  diagnosis: DiagnosisResult;
  context?: DiagnosisContext;
  aiInsight?: AIInsightResult | null;
}

export async function ActionPlanSection({
  diagnosis,
  context,
  aiInsight,
}: ActionPlanSectionProps) {
  const view = await resolveActionPlanView(diagnosis, context, aiInsight);
  return <ActionPlanDetail view={view} />;
}
