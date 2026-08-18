import "server-only";

import { store as mockStore } from "@/lib/data/mockData";
import { runDiagnosis } from "@/lib/ai/diagnosisEngine";
import { generateActionPlan } from "@/lib/ai/generateActionPlan";
import { getRevenueMetrics } from "@/lib/ai/getRevenueMetrics";
import { getTodayMetrics } from "@/lib/metrics/calculateMetrics";
import type {
  ActionPlanApiResponse,
  DashboardApiResponse,
  DiagnosisApiResponse,
} from "@/lib/api/apiTypes";

/** API 不可用时，使用 mockData + 现有 lib 逻辑生成页面数据 */
export function getDashboardFallback(): DashboardApiResponse {
  const metrics = getTodayMetrics();
  const diagnosis = runDiagnosis();

  return {
    store: mockStore,
    metrics,
    revenueStatus: getRevenueMetrics(),
    insights: diagnosis.insights,
    status: diagnosis.status,
  };
}

export function getDiagnosisFallback(): DiagnosisApiResponse {
  const metrics = getTodayMetrics();
  const diagnosis = runDiagnosis();

  return {
    store: mockStore,
    metrics,
    diagnosis,
  };
}

export function getActionPlanFallback(): ActionPlanApiResponse {
  const diagnosis = runDiagnosis();
  const plan = generateActionPlan();

  return {
    store: mockStore,
    plan,
    diagnosisSummary: diagnosis.summary,
    basedOn: {
      status: diagnosis.status,
      primaryCause: diagnosis.primaryCause,
      customerCause: diagnosis.customerCause,
    },
  };
}
