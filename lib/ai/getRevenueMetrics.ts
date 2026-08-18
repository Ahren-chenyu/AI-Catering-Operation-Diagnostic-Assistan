import { historicalBaseline as mockHistoricalBaseline } from "@/lib/data/mockData";
import { getTodayMetrics } from "@/lib/metrics/calculateMetrics";
import { DEMO_ANOMALY_THRESHOLD } from "./diagnosisConfig";
import type { DailyMetrics, DiagnosisContext, HistoricalBaseline, RevenueMetrics } from "@/types";

export { DEMO_ANOMALY_THRESHOLD } from "./diagnosisConfig";

function resolveContext(context?: DiagnosisContext): {
  metrics: DailyMetrics;
  baseline: HistoricalBaseline;
} {
  if (context) {
    return context;
  }

  const metrics = getTodayMetrics();
  return { metrics, baseline: mockHistoricalBaseline };
}

export function getRevenueMetrics(context?: DiagnosisContext): RevenueMetrics {
  const { metrics, baseline } = resolveContext(context);

  return {
    revenue: metrics.revenue,
    revenueChange: metrics.revenueChange,
    yoyChange: metrics.revenueChange,
    momChange: metrics.revenueChange,
    historicalAverage: baseline.revenueAverage,
    isAnomaly: Math.abs(metrics.revenueChange) >= DEMO_ANOMALY_THRESHOLD,
  };
}
