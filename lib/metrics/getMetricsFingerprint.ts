import type { DailyMetrics } from "@/types";

/** 经营数据指纹：数据库指标变化时用于使 AI 缓存失效 */
export function getMetricsFingerprint(metrics: DailyMetrics): string {
  return [
    metrics.revenue,
    metrics.orders,
    metrics.averageOrderValue,
    metrics.newCustomers,
    metrics.returningCustomers,
    metrics.revenueChange.toFixed(2),
    metrics.ordersChange.toFixed(2),
    metrics.averageOrderValueChange.toFixed(2),
    metrics.newCustomersChange.toFixed(2),
    metrics.returningCustomersChange.toFixed(2),
  ].join("|");
}
