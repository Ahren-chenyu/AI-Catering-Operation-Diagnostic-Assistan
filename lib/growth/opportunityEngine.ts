import type {
  GrowthKpi,
  GrowthOpportunity,
  GrowthOrder,
  GrowthUser,
  OpportunityId,
  SegmentSummary,
} from "@/types/growth";
import { calcRepeatRate } from "./calc";
import { daysBetween } from "./seed";

function countNewUsers(users: GrowthUser[], asOf: string, withinDays: number): number {
  return users.filter((u) => daysBetween(u.firstOrderDate, asOf) <= withinDays).length;
}

export function detectOpportunities(
  users: GrowthUser[],
  orders: GrowthOrder[],
  asOf: string,
  kpis: GrowthKpi[],
  segments: SegmentSummary[]
): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = [];

  const newUsersKpi = kpis.find((k) => k.key === "new_users");
  const repeatKpi = kpis.find((k) => k.key === "repeat_rate");
  const arpuKpi = kpis.find((k) => k.key === "arpu");
  const mauKpi = kpis.find((k) => k.key === "mau");
  const retentionKpi = kpis.find((k) => k.key === "retention_30");

  const newUsers30 = countNewUsers(users, asOf, 30);
  const newCohort = users.filter((u) => daysBetween(u.firstOrderDate, asOf) <= 30);
  const repeatRate = calcRepeatRate(newCohort);

  const pendingRepeat = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d >= 7 && d <= 14 && u.orderCount === 1;
  });

  if (repeatKpi && (repeatKpi.change < 0 || repeatRate < 22)) {
    opportunities.push({
      id: "new_repeat_low",
      title: "新客复购偏低",
      severity: "critical",
      discovery: [
        `最近30天新增用户 ${newUsers30.toLocaleString("zh-CN")} 人。`,
        `其中只有 ${repeatRate}% 完成第二次消费。`,
        `较上月 ${repeatKpi.change >= 0 ? "上升" : "下降"} ${Math.abs(repeatKpi.change)} 个百分点。`,
      ],
      judgment: "新客获取正常，但首购→复购环节存在明显流失。",
      targetUsers: "首购7–14天且未产生第二次消费用户",
      targetUserCount: pendingRepeat.length,
      growthGoal: "提高新客30日复购率",
      ctaLabel: "生成增长方案",
      evidenceMetrics: {
        newUsers30,
        repeatRate,
        repeatRateChange: repeatKpi.change,
        targetUserCount: pendingRepeat.length,
      },
    });
  }

  const highValueUsers = users.filter((u) => u.segmentId === "high_value");
  const highValue90 =
    highValueUsers.length +
    users.filter(
      (u) => u.segmentId === "churn_risk" && (u.valueTier === "高价值" || u.monetary >= 400)
    ).length;
  const decliningHigh = users.filter((u) => {
    if (u.ordersPrev60 < 2) return false;
    const expected = u.ordersPrev60 / 2;
    const dropping = expected > 0 && u.ordersLast30 / expected < 0.7;
    return (
      dropping &&
      (u.segmentId === "high_value" || u.segmentId === "churn_risk" || u.valueTier === "高价值")
    );
  });

  if (decliningHigh.length / Math.max(highValue90, 1) > 0.15) {
    opportunities.push({
      id: "high_value_decline",
      title: "高价值用户活跃下降",
      severity: "warning",
      discovery: [
        `过去90天高价值相关用户：${highValue90} 人。`,
        `其中 ${decliningHigh.length} 人最近30天消费频率下降超过30%。`,
        `当前高价值分层：${highValueUsers.length} 人。`,
      ],
      judgment: "存在高价值用户流失风险，需优先定向召回。",
      targetUsers: "高价值/曾高消费且近30天频次下降用户",
      targetUserCount: decliningHigh.length,
      growthGoal: "降低高价值用户流失，恢复消费频次",
      ctaLabel: "生成召回方案",
      evidenceMetrics: {
        highValue90,
        decliningHigh: decliningHigh.length,
        highValueCurrent: highValueUsers.length,
      },
    });
  }

  const lunchByWeek: number[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = w * 7 + 6;
    const end = w * 7;
    let count = 0;
    for (const o of orders) {
      const d = daysBetween(o.orderDate, asOf);
      if (d >= end && d <= start && o.mealPeriod === "午餐") count++;
    }
    lunchByWeek.push(count);
  }
  const lunchDeclining =
    lunchByWeek.length >= 3 &&
    lunchByWeek[0]! > lunchByWeek[1]! &&
    lunchByWeek[1]! > lunchByWeek[2]!;
  const lunchUsers = users.filter((u) => u.preferredTime === "午餐").length;

  if (lunchDeclining || lunchByWeek[3]! < lunchByWeek[0]! * 0.9) {
    const dropPct =
      lunchByWeek[0]! > 0
        ? Math.round(((lunchByWeek[0]! - lunchByWeek[3]!) / lunchByWeek[0]!) * 1000) / 10
        : 0;
    opportunities.push({
      id: "lunch_growth",
      title: "午餐用户增长机会",
      severity: "info",
      discovery: [
        `近4周工作日午餐订单呈下降趋势（约 -${dropPct}%）。`,
        `历史午餐偏好用户基础约 ${lunchUsers} 人。`,
        "附近办公场景用户池仍在，但到店/下单意愿减弱。",
      ],
      judgment: "存在午餐用户召回和套餐优化机会。",
      targetUsers: "工作日午餐偏好且近14天未消费用户",
      targetUserCount: users.filter((u) => u.preferredTime === "午餐" && u.recencyDays >= 14).length,
      growthGoal: "提升工作日午餐订单量与套餐转化",
      ctaLabel: "生成午餐增长方案",
      evidenceMetrics: {
        lunchWeek0: lunchByWeek[0]!,
        lunchWeek3: lunchByWeek[3]!,
        lunchUsers,
        dropPct,
      },
    });
  }

  if (arpuKpi && mauKpi && arpuKpi.change < -2 && Math.abs(mauKpi.change) < 5) {
    opportunities.push({
      id: "arpu_lift",
      title: "客单价提升机会",
      severity: "warning",
      discovery: [
        `ARPU 环比 ${arpuKpi.change}%（当前 ${arpuKpi.displayValue}）。`,
        `月活跃用户环比 ${mauKpi.change}%，基本稳定。`,
        "活跃未明显下滑，但人均贡献下降，说明提客单空间更大。",
      ],
      judgment: "流量基本稳住，增长应转向客单价与组合销售。",
      targetUsers: "潜力用户（频次尚可、客单偏低）",
      targetUserCount: segments.find((s) => s.id === "potential")?.userCount ?? 0,
      growthGoal: "在活跃稳定前提下提升 ARPU",
      ctaLabel: "生成提客单方案",
      evidenceMetrics: {
        arpu: arpuKpi.value,
        arpuChange: arpuKpi.change,
        mauChange: mauKpi.change,
      },
    });
  }

  if (newUsersKpi && retentionKpi && newUsersKpi.change > 5 && retentionKpi.change < -1) {
    opportunities.push({
      id: "growth_quality",
      title: "增长质量风险",
      severity: "warning",
      discovery: [
        `本月新增用户环比 ${newUsersKpi.change}%（${newUsersKpi.displayValue} 人）。`,
        `30日留存率环比 ${retentionKpi.change} 个百分点。`,
        "获客在加快，但留存走弱，增长质量承压。",
      ],
      judgment: "需要从「拉新」转向「拉新+留存」双目标。",
      targetUsers: "近30天新客且尚未完成第二次消费",
      targetUserCount: pendingRepeat.length,
      growthGoal: "提升新客留存与复购，改善增长质量",
      ctaLabel: "生成留存提升方案",
      evidenceMetrics: {
        newUsersChange: newUsersKpi.change,
        retentionChange: retentionKpi.change,
      },
    });
  }

  if (opportunities.length === 0) {
    opportunities.push({
      id: "new_repeat_low",
      title: "新客复购偏低",
      severity: "critical",
      discovery: [`最近30天新增用户 ${newUsers30} 人。`, `复购率 ${repeatRate}%。`],
      judgment: "首购→复购环节仍有优化空间。",
      targetUsers: "首购7–14天且未复购用户",
      targetUserCount: pendingRepeat.length,
      growthGoal: "提高新客30日复购率",
      ctaLabel: "生成增长方案",
      evidenceMetrics: { newUsers30, repeatRate },
    });
  }

  const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  return opportunities
    .sort((a, b) => order[a.severity]! - order[b.severity]!)
    .slice(0, 5);
}

export function getOpportunityById(
  id: OpportunityId,
  list: GrowthOpportunity[]
): GrowthOpportunity | undefined {
  return list.find((o) => o.id === id);
}
