import { generateActionPlan } from "@/lib/ai/generateActionPlan";
import type {
  ActionPlan,
  ActionPlanViewModel,
  AIInsightResult,
  DiagnosisContext,
  DiagnosisResult,
} from "@/types";

const AI_ESTIMATE_LABEL = "AI测算值";

function mapRulesPlanToView(
  diagnosis: DiagnosisResult,
  plan: ActionPlan
): ActionPlanViewModel {
  return {
    source: "rules",
    coreProblem: plan.target,
    title: plan.title,
    reason: plan.reason,
    steps: [
      `确定行动方案：${plan.title}`,
      `按方案执行，周期 ${plan.duration}，每日跟踪 ${plan.coreMetrics.join("、")}`,
      `到期复盘：${plan.reviewMetrics.join("、")}`,
    ],
    duration: plan.duration,
    budget: plan.budget,
    budgetNote: plan.budgetNote || AI_ESTIMATE_LABEL,
    targetMetric: plan.target,
    targetNote: AI_ESTIMATE_LABEL,
    reviewMetrics: plan.reviewMetrics,
  };
}

function mapAiInsightToView(
  diagnosis: DiagnosisResult,
  insight: AIInsightResult
): ActionPlanViewModel {
  const action = insight.recommendedAction;

  return {
    source: "deepseek",
    coreProblem: action.objective,
    title: action.title,
    reason: insight.reasoning,
    steps: action.steps,
    duration: action.duration,
    budget: action.budget,
    budgetNote: AI_ESTIMATE_LABEL,
    targetMetric: action.targetMetric,
    targetNote: AI_ESTIMATE_LABEL,
    reviewMetrics: action.reviewMetrics,
  };
}

/** 基于 DiagnosisResult 与 AIInsight 构建 Action Plan 展示模型 */
export function buildActionPlanView(
  diagnosis: DiagnosisResult,
  context: DiagnosisContext | undefined,
  aiInsight: AIInsightResult | null | undefined
): ActionPlanViewModel {
  const rulesView = mapRulesPlanToView(diagnosis, generateActionPlan(context));

  if (aiInsight) {
    return mapAiInsightToView(diagnosis, aiInsight);
  }

  return rulesView;
}
