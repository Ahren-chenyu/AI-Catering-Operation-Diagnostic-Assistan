import { historicalBaseline, todayMetrics } from "@/lib/data/mockData";
import type { DailyMetrics, HistoricalBaseline, RawDailyMetrics } from "@/types";

/**
 * 统一变化率公式：(current - baseline) / baseline × 100%
 * 结果保留一位小数。
 */
export function percentChange(current: number, baseline: number): number {
  if (baseline === 0) {
    return 0;
  }
  return Math.round(((current - baseline) / baseline) * 1000) / 10;
}

/**
 * 由原始经营数据与历史基线计算派生指标。
 * 客单价优先使用源数据中的值（Demo 数据与 revenue/orders 不完全一致）。
 */
export function calculateMetrics(
  raw: RawDailyMetrics,
  baseline: HistoricalBaseline
): DailyMetrics {
  const averageOrderValue =
    raw.averageOrderValue ?? Math.round((raw.revenue / raw.orders) * 10) / 10;

  return {
    ...raw,
    averageOrderValue,
    revenueChange: percentChange(raw.revenue, baseline.revenueAverage),
    ordersChange: percentChange(raw.orders, baseline.ordersAverage),
    averageOrderValueChange: percentChange(
      averageOrderValue,
      baseline.averageOrderValueAverage
    ),
    newCustomersChange: percentChange(raw.newCustomers, baseline.newCustomersAverage),
    returningCustomersChange: percentChange(
      raw.returningCustomers,
      baseline.returningCustomersAverage
    ),
  };
}

/** 获取当日完整指标（原始值 + 计算变化率） */
export function getTodayMetrics(): DailyMetrics {
  return calculateMetrics(todayMetrics, historicalBaseline);
}
