import "server-only";

import { isSameDiagnosis } from "@/lib/ai/isSameDiagnosis";
import { runDiagnosis } from "@/lib/ai/diagnosisEngine";
import { isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { generateAIInsight } from "@/lib/ai/generateAIInsight";
import {
  getDiagnosisSnapshot,
  saveDiagnosisSnapshot,
} from "@/lib/db/diagnosisSnapshotRepository";
import { loadBusinessContext } from "@/lib/services/businessContextService";
import type {
  AIInsightResult,
  DailyMetrics,
  DiagnosisResult,
  DiagnosisSnapshotPayload,
  Store,
} from "@/types";

export interface DailyDiagnosisSnapshotResult {
  store: Store;
  metrics: DailyMetrics;
  diagnosis: DiagnosisResult;
  aiInsight: AIInsightResult | null;
  fromSnapshot: boolean;
}

export async function getOrCreateDailyDiagnosisSnapshot(
  storeId: string,
  date: string
): Promise<DailyDiagnosisSnapshotResult> {
  const context = await loadBusinessContext(storeId, date);
  const diagnosis = runDiagnosis({
    metrics: context.metrics,
    baseline: context.baseline,
  });

  const existing = await getDiagnosisSnapshot(storeId, date);

  if (
    existing &&
    isSameDiagnosis(diagnosis, existing.diagnosis) &&
    existing.aiInsight
  ) {
    return {
      store: context.store,
      metrics: context.metrics,
      diagnosis,
      aiInsight: existing.aiInsight,
      fromSnapshot: true,
    };
  }

  let aiInsight: AIInsightResult | null = null;

  if (isDeepSeekConfigured()) {
    try {
      aiInsight = await generateAIInsight(diagnosis);
    } catch (error) {
      console.error(
        "[dailyDiagnosisSnapshotService] DeepSeek 生成失败:",
        error instanceof Error ? error.message : error
      );
      aiInsight = null;
    }
  }

  const payload: DiagnosisSnapshotPayload = { diagnosis, aiInsight };

  try {
    await saveDiagnosisSnapshot(storeId, date, payload);
  } catch (error) {
    console.error(
      "[dailyDiagnosisSnapshotService] 保存诊断快照失败:",
      error instanceof Error ? error.message : error
    );
  }

  return {
    store: context.store,
    metrics: context.metrics,
    diagnosis,
    aiInsight,
    fromSnapshot: false,
  };
}
