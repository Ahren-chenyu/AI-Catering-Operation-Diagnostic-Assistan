import { getTodayMetrics } from "@/lib/metrics/calculateMetrics";
import type { DailyMetrics, OrderMetrics } from "@/types";

export function getOrderMetrics(metrics: DailyMetrics = getTodayMetrics()): OrderMetrics {
  return {
    orders: metrics.orders,
    ordersChange: metrics.ordersChange,
    yoyChange: metrics.ordersChange,
    momChange: metrics.ordersChange,
  };
}
