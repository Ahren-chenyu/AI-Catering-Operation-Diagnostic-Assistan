import { formatChange } from "@/lib/utils";
import { getCustomerMetrics } from "./getCustomerMetrics";
import { runDiagnosis } from "./diagnosisEngine";
import type { ActionPlan, DiagnosisContext } from "@/types";

export function generateActionPlan(context?: DiagnosisContext): ActionPlan {
  const diagnosis = runDiagnosis(context);
  const metrics = context?.metrics;
  const customers = getCustomerMetrics(metrics);

  if (diagnosis.status === "normal") {
    return {
      title: "持续观察经营数据",
      coreProblem: diagnosis.summary,
      reason:
        "当前营业额处于正常波动范围，暂不需要启动专项行动计划。建议持续观察核心指标变化。",
      duration: "7 天",
      budget: "¥0",
      budgetNote: "AI 测算值",
      target: "保持经营指标稳定",
      coreMetrics: ["营业额", "订单量", "客单价"],
      reviewMetrics: ["营业额变化率", "订单量变化率", "新客变化率"],
    };
  }

  const focusLabel =
    diagnosis.customerCause === "new"
      ? "新客"
      : diagnosis.customerCause === "returning"
        ? "老客"
        : "客流";

  return {
    title: "工作日午餐新客套餐",
    coreProblem: diagnosis.summary,
    reason: `诊断显示${diagnosis.primaryCause === "orders" || diagnosis.primaryCause === "both" ? "订单量变化" : "客单价变化"}是当前主要观察方向；${focusLabel}指标变化 ${formatChange(customers.newCustomersChange)}（新客）/ ${formatChange(customers.returningCustomersChange)}（老客）。针对${focusLabel === "新客" ? "新客获取" : "客流"}推出限时套餐，能以较低成本快速验证改善效果。`,
    duration: "7 天",
    budget: "¥2,000 ～ ¥3,000",
    budgetNote: "AI 测算值",
    target: "新增 100 ～ 150 名新客",
    coreMetrics: ["新客订单数", "订单量", "营业额"],
    reviewMetrics: ["新客成本", "营业额", "订单量", "7 日复购率"],
  };
}
