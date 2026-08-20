import "server-only";

import { getRevenueMetrics } from "@/lib/ai/getRevenueMetrics";
import { runDiagnosis } from "@/lib/ai/diagnosisEngine";
import { generateActionPlan } from "@/lib/ai/generateActionPlan";
import {
  getDefaultQueryDate,
  loadBusinessContext,
} from "@/lib/services/businessContextService";
import { getOrCreateDailyDiagnosisSnapshot } from "@/lib/services/dailyDiagnosisSnapshotService";
import type {
  ActionPlanApiResponse,
  DashboardApiResponse,
  DiagnosisApiResponse,
} from "@/lib/api/apiTypes";

export async function buildDashboardResponse(
  storeId: string,
  date: string
): Promise<DashboardApiResponse> {
  const context = await loadBusinessContext(storeId, date);
  const diagnosisContext = {
    metrics: context.metrics,
    baseline: context.baseline,
  };
  const diagnosis = runDiagnosis(diagnosisContext);

  return {
    store: context.store,
    metrics: context.metrics,
    revenueStatus: getRevenueMetrics(diagnosisContext),
    insights: diagnosis.insights,
    status: diagnosis.status,
  };
}

export async function buildDiagnosisResponse(
  storeId: string,
  date: string
): Promise<DiagnosisApiResponse> {
  const snapshot = await getOrCreateDailyDiagnosisSnapshot(storeId, date);

  return {
    store: snapshot.store,
    metrics: snapshot.metrics,
    diagnosis: snapshot.diagnosis,
    aiInsight: snapshot.aiInsight,
    fromSnapshot: snapshot.fromSnapshot,
  };
}

export async function buildActionPlanResponse(
  storeId: string,
  date: string
): Promise<ActionPlanApiResponse> {
  const context = await loadBusinessContext(storeId, date);
  const diagnosisContext = {
    metrics: context.metrics,
    baseline: context.baseline,
  };
  const diagnosis = runDiagnosis(diagnosisContext);
  const plan = generateActionPlan(diagnosisContext);

  return {
    store: context.store,
    plan,
    diagnosisSummary: diagnosis.summary,
    basedOn: {
      status: diagnosis.status,
      primaryCause: diagnosis.primaryCause,
      customerCause: diagnosis.customerCause,
    },
  };
}

export function getDefaultPageQuery(): { storeId: string; date: string } {
  return {
    storeId: "store-001",
    date: getDefaultQueryDate(),
  };
}
