import type {
  GrowthDashboardData,
  GrowthKpi,
  GrowthOrder,
  GrowthUser,
  MonthlyTrendPoint,
  SegmentId,
  TrendPoint,
} from "@/types/growth";
import { calcArpu, calcRepeatRate, pctChange } from "./calc";
import { getGrowthDataset } from "./dataset";
import { detectOpportunities } from "./opportunityEngine";
import { buildSegmentSummaries } from "./rfm";
import { addDays, daysBetween, monthLabel } from "./seed";

export { calcArpu, calcRepeatRate, calcRoi } from "./calc";

function usersActiveInRange(
  orders: GrowthOrder[],
  asOf: string,
  startDaysAgo: number,
  endDaysAgo: number
): Set<string> {
  const set = new Set<string>();
  for (const o of orders) {
    const d = daysBetween(o.orderDate, asOf);
    if (d >= endDaysAgo && d <= startDaysAgo) {
      set.add(o.userId);
    }
  }
  return set;
}

function revenueInRange(
  orders: GrowthOrder[],
  asOf: string,
  startDaysAgo: number,
  endDaysAgo: number
): number {
  let sum = 0;
  for (const o of orders) {
    const d = daysBetween(o.orderDate, asOf);
    if (d >= endDaysAgo && d <= startDaysAgo) {
      sum += o.amount;
    }
  }
  return sum;
}

/** 指定周期首次消费用户 */
export function countNewUsers(
  users: GrowthUser[],
  asOf: string,
  withinDays: number
): number {
  return users.filter((u) => daysBetween(u.firstOrderDate, asOf) <= withinDays)
    .length;
}

export function buildGrowthKpis(
  users: GrowthUser[],
  orders: GrowthOrder[],
  asOf: string
): GrowthKpi[] {
  const totalUsers = users.length;

  const newThisMonth = countNewUsers(users, asOf, 30);
  const newPrevMonth = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d > 30 && d <= 60;
  }).length;

  const mau = usersActiveInRange(orders, asOf, 30, 0).size;
  const prevMau = usersActiveInRange(orders, asOf, 60, 31).size;

  // 30 日留存：上月新客在本月仍有消费
  const cohort = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d > 30 && d <= 60;
  });
  const retained = cohort.filter((u) => {
    return orders.some((o) => {
      if (o.userId !== u.userId) return false;
      const d = daysBetween(o.orderDate, asOf);
      return d <= 30;
    });
  }).length;
  const retention30 =
    cohort.length > 0
      ? Math.round((retained / cohort.length) * 1000) / 10
      : 0;
  const prevCohort = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d > 60 && d <= 90;
  });
  const prevRetained = prevCohort.filter((u) =>
    orders.some((o) => {
      if (o.userId !== u.userId) return false;
      const d = daysBetween(o.orderDate, asOf);
      return d > 30 && d <= 60;
    })
  ).length;
  const prevRetention =
    prevCohort.length > 0
      ? Math.round((prevRetained / prevCohort.length) * 1000) / 10
      : retention30;

  const newUsers30 = users.filter(
    (u) => daysBetween(u.firstOrderDate, asOf) <= 30
  );
  const repeatRate = calcRepeatRate(newUsers30);
  const prevNewUsers = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d > 30 && d <= 60;
  });
  // 上月新客的「当时」复购：至今订单≥2 近似
  const prevRepeatRate = calcRepeatRate(prevNewUsers);

  const rev30 = revenueInRange(orders, asOf, 30, 0);
  const revPrev = revenueInRange(orders, asOf, 60, 31);
  const arpu = calcArpu(rev30, mau);
  const prevArpu = calcArpu(revPrev, prevMau);

  const highValue = users.filter((u) => u.segmentId === "high_value").length;
  const prevHighApprox = Math.round(highValue / 1.04);

  const churnRisk = users.filter((u) => u.segmentId === "churn_risk").length;
  const prevChurnApprox = Math.round(churnRisk / 1.15);

  const kpis: GrowthKpi[] = [
    {
      key: "total_users",
      label: "总用户数",
      value: totalUsers,
      displayValue: totalUsers.toLocaleString("zh-CN"),
      change: 4.8,
      explanation: "累计产生过至少 1 次消费的用户",
      isAnomaly: false,
    },
    {
      key: "new_users",
      label: "本月新增用户",
      value: newThisMonth,
      displayValue: newThisMonth.toLocaleString("zh-CN"),
      change: pctChange(newThisMonth, newPrevMonth),
      explanation: "近 30 天首次消费用户",
      isAnomaly: false,
    },
    {
      key: "mau",
      label: "月活跃用户",
      value: mau,
      displayValue: mau.toLocaleString("zh-CN"),
      change: pctChange(mau, prevMau),
      explanation: "近 30 天产生消费的用户数",
      isAnomaly: false,
    },
    {
      key: "retention_30",
      label: "30日留存率",
      value: retention30,
      displayValue: `${retention30}%`,
      change: Math.round((retention30 - prevRetention) * 10) / 10,
      explanation: "上月新客在本月仍消费的比例",
      isAnomaly: retention30 < prevRetention - 2,
    },
    {
      key: "repeat_rate",
      label: "复购率",
      value: repeatRate,
      displayValue: `${repeatRate}%`,
      change: Math.round((repeatRate - prevRepeatRate) * 10) / 10,
      explanation: "近 30 天新客中完成 ≥2 次消费的比例",
      isAnomaly: repeatRate < prevRepeatRate,
    },
    {
      key: "arpu",
      label: "ARPU",
      value: arpu,
      displayValue: `¥${arpu.toLocaleString("zh-CN")}`,
      change: pctChange(arpu, prevArpu),
      explanation: "近 30 天收入 ÷ 月活跃用户",
      isAnomaly: arpu < prevArpu && mau >= prevMau * 0.95,
    },
    {
      key: "high_value",
      label: "高价值用户数",
      value: highValue,
      displayValue: highValue.toLocaleString("zh-CN"),
      change: pctChange(highValue, prevHighApprox),
      explanation: "RFM：近期消费 + 高频 + 高金额",
      isAnomaly: false,
    },
    {
      key: "churn_risk",
      label: "流失风险用户数",
      value: churnRisk,
      displayValue: churnRisk.toLocaleString("zh-CN"),
      change: pctChange(churnRisk, prevChurnApprox),
      explanation: "曾活跃/高价值但近期频次明显下降",
      isAnomaly: churnRisk > prevChurnApprox,
    },
  ];

  return kpis;
}

export function buildNewUserTrend(
  users: GrowthUser[],
  asOf: string,
  days = 30
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(asOf, -i);
    const value = users.filter((u) => u.firstOrderDate === date).length;
    points.push({ date, value });
  }
  return points;
}

export function buildActiveUserTrend(
  orders: GrowthOrder[],
  asOf: string,
  days = 30
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(asOf, -i);
    const set = new Set(
      orders.filter((o) => o.orderDate === date).map((o) => o.userId)
    );
    points.push({ date, value: set.size });
  }
  return points;
}

export function buildRepeatRateTrend(
  users: GrowthUser[],
  asOf: string,
  months = 6
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];
  for (let m = months - 1; m >= 0; m--) {
    const monthEnd = addDays(asOf, -m * 30);
    const monthStart = addDays(monthEnd, -29);
    const cohort = users.filter((u) => {
      return (
        u.firstOrderDate >= monthStart && u.firstOrderDate <= monthEnd
      );
    });
    const rate = calcRepeatRate(cohort);
    points.push({ month: monthLabel(monthEnd), value: rate });
  }
  return points;
}

export function buildArpuTrend(
  orders: GrowthOrder[],
  asOf: string,
  months = 6
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];
  for (let m = months - 1; m >= 0; m--) {
    const endOffset = m * 30;
    const startOffset = endOffset + 29;
    const monthEnd = addDays(asOf, -endOffset);
    const active = usersActiveInRange(orders, asOf, startOffset, endOffset);
    const revenue = revenueInRange(orders, asOf, startOffset, endOffset);
    points.push({
      month: monthLabel(monthEnd),
      value: calcArpu(revenue, active.size),
    });
  }
  return points;
}

/** 增长驾驶舱一次性数据（单源） */
export function getGrowthDashboardData(): GrowthDashboardData {
  const { asOfDate, users, orders } = getGrowthDataset();
  const kpis = buildGrowthKpis(users, orders, asOfDate);
  const segments = buildSegmentSummaries(users);
  const opportunities = detectOpportunities(users, orders, asOfDate, kpis, segments);

  return {
    asOfDate,
    kpis,
    newUserTrend: buildNewUserTrend(users, asOfDate),
    activeUserTrend: buildActiveUserTrend(orders, asOfDate),
    repeatRateTrend: buildRepeatRateTrend(users, asOfDate),
    arpuTrend: buildArpuTrend(orders, asOfDate),
    opportunities,
    segments,
  };
}

export function getUsersBySegment(segmentId: SegmentId): GrowthUser[] {
  return getGrowthDataset().users.filter((u) => u.segmentId === segmentId);
}

export function getUserById(userId: string): GrowthUser | undefined {
  return getGrowthDataset().users.find((u) => u.userId === userId);
}
