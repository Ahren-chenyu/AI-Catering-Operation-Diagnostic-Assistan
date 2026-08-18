import { getTodayMetrics } from "@/lib/metrics/calculateMetrics";
import type { CustomerMetrics, DailyMetrics } from "@/types";

export function getCustomerMetrics(
  metrics: DailyMetrics = getTodayMetrics()
): CustomerMetrics {
  return {
    newCustomers: metrics.newCustomers,
    newCustomersChange: metrics.newCustomersChange,
    returningCustomers: metrics.returningCustomers,
    returningCustomersChange: metrics.returningCustomersChange,
  };
}
