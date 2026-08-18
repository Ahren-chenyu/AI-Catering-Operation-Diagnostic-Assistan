import "server-only";

import { todayMetrics as mockTodayMetrics } from "@/lib/data/mockData";
import { calculateMetrics } from "@/lib/metrics/calculateMetrics";
import {
  getDailyMetrics,
  getHistoricalBaseline,
  getStore,
} from "@/lib/services/dataProvider";
import type { BusinessContext } from "@/types";

export class BusinessDataError extends Error {
  constructor(
    message: string,
    public readonly code: "STORE_NOT_FOUND" | "METRICS_NOT_FOUND" | "BASELINE_NOT_FOUND"
  ) {
    super(message);
    this.name = "BusinessDataError";
  }
}

/** 从 dataProvider 加载门店、原始指标与基线，并计算派生指标 */
export async function loadBusinessContext(
  storeId: string,
  date: string
): Promise<BusinessContext> {
  const [store, rawMetrics, baseline] = await Promise.all([
    getStore(storeId),
    getDailyMetrics(storeId, date),
    getHistoricalBaseline(storeId),
  ]);

  if (!store) {
    throw new BusinessDataError(
      `未找到门店：${storeId}`,
      "STORE_NOT_FOUND"
    );
  }

  if (!rawMetrics) {
    throw new BusinessDataError(
      `未找到 ${date} 的经营数据（storeId=${storeId}）`,
      "METRICS_NOT_FOUND"
    );
  }

  if (!baseline) {
    throw new BusinessDataError(
      `未找到门店 ${storeId} 的历史基线数据`,
      "BASELINE_NOT_FOUND"
    );
  }

  return {
    store,
    rawMetrics,
    baseline,
    metrics: calculateMetrics(rawMetrics, baseline),
  };
}

export function getDefaultQueryDate(): string {
  return mockTodayMetrics.date;
}
