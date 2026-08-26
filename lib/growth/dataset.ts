import type {
  Channel,
  CouponSensitivity,
  GrowthCampaign,
  GrowthDataset,
  GrowthOrder,
  GrowthUser,
  LifecycleStage,
  MealPeriod,
  SegmentId,
  ValueTier,
} from "@/types/growth";
import {
  addDays,
  createSeededRandom,
  daysBetween,
  pick,
  randFloat,
  randInt,
} from "./seed";

export const GROWTH_AS_OF = "2026-08-26";
const SEED = 20260826;
const USER_COUNT = 1800;

const CATEGORIES = [
  "招牌烤串套餐",
  "双人畅享套餐",
  "工作日午餐套餐",
  "羊肉串",
  "牛肉串",
  "烤翅",
  "烤茄子",
  "啤酒饮品",
] as const;

const CHANNELS: Channel[] = ["堂食", "外卖", "美团", "抖音", "小程序"];
const MEAL_PERIODS: MealPeriod[] = ["午餐", "晚餐", "夜宵"];
const SENSITIVITIES: CouponSensitivity[] = ["高", "中", "低"];

let cached: GrowthDataset | null = null;

function assignSegment(input: {
  recencyDays: number;
  frequency: number;
  monetary: number;
  firstOrderDays: number;
  ordersLast30: number;
  ordersPrev60: number;
}): SegmentId {
  const { recencyDays, frequency, monetary, firstOrderDays, ordersLast30, ordersPrev60 } = input;
  if (firstOrderDays <= 30 && frequency <= 2) return "new";
  if (
    ordersPrev60 >= 3 &&
    ordersLast30 / Math.max(ordersPrev60 / 2, 1) < 0.7 &&
    recencyDays >= 14
  ) {
    return "churn_risk";
  }
  if (recencyDays > 45) return "dormant";
  if (recencyDays <= 21 && frequency >= 4 && monetary >= 400) return "high_value";
  if (recencyDays <= 30 && frequency >= 3 && monetary < 400) return "potential";
  if (recencyDays <= 30 && frequency >= 3) return monetary >= 350 ? "high_value" : "potential";
  return "potential";
}

function toLifecycle(segment: SegmentId, firstOrderDays: number): LifecycleStage {
  if (segment === "new" || firstOrderDays <= 14) return "新客";
  if (segment === "churn_risk") return "流失风险";
  if (segment === "dormant") return "沉睡用户";
  if (segment === "high_value") return "成熟用户";
  return "成长期";
}

function toValueTier(monetary: number, frequency: number): ValueTier {
  if (monetary >= 450 && frequency >= 4) return "高价值";
  if (monetary >= 200 || frequency >= 3) return "中价值";
  return "低价值";
}

function buildTags(
  segment: SegmentId,
  preferredTime: MealPeriod,
  channel: Channel,
  sensitivity: CouponSensitivity,
  category: string
): string[] {
  const tags: string[] = [];
  if (preferredTime === "午餐") tags.push("工作日午餐");
  if (preferredTime === "晚餐") tags.push("晚餐聚餐");
  if (preferredTime === "夜宵") tags.push("夜宵消费");
  if (channel === "外卖" || channel === "美团") tags.push("外卖高频");
  if (channel === "堂食") tags.push("堂食高频");
  if (category.includes("套餐")) tags.push("套餐偏好");
  if (category.includes("酒") || category.includes("饮")) tags.push("饮品偏好");
  if (sensitivity === "高") tags.push("优惠敏感");
  if (sensitivity === "低") tags.push("低价格敏感");
  if (segment === "high_value") tags.push("高价值");
  if (segment === "churn_risk") tags.push("流失风险");
  return tags;
}

function generateOrders(
  rand: () => number,
  userId: string,
  firstOrderDate: string,
  asOf: string,
  targetCount: number,
  preferredTime: MealPeriod,
  channel: Channel,
  category: string
): GrowthOrder[] {
  const orders: GrowthOrder[] = [];
  const span = Math.max(daysBetween(firstOrderDate, asOf), 1);
  const used = new Set<string>();
  for (let i = 0; i < targetCount; i++) {
    let date = i === 0 ? firstOrderDate : addDays(firstOrderDate, randInt(rand, 0, span));
    if (daysBetween(date, asOf) < 0) date = asOf;
    let guard = 0;
    while (used.has(date) && guard < 5) {
      date = addDays(date, randInt(rand, -2, 2));
      if (daysBetween(date, asOf) < 0) date = asOf;
      if (daysBetween(firstOrderDate, date) < 0) date = firstOrderDate;
      guard++;
    }
    used.add(date);
    const base =
      preferredTime === "午餐"
        ? randFloat(rand, 28, 68)
        : preferredTime === "夜宵"
          ? randFloat(rand, 55, 120)
          : randFloat(rand, 70, 160);
    orders.push({
      orderId: `ORD-${userId}-${i + 1}`,
      userId,
      orderDate: date,
      amount: Math.round(base * 10) / 10,
      channel: rand() < 0.7 ? channel : pick(rand, CHANNELS),
      mealPeriod: rand() < 0.55 ? preferredTime : pick(rand, MEAL_PERIODS),
      category: rand() < 0.65 ? category : pick(rand, [...CATEGORIES]),
    });
  }
  orders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
  return orders;
}

function buildUsersAndOrders(asOf: string): { users: GrowthUser[]; orders: GrowthOrder[] } {
  const rand = createSeededRandom(SEED);
  const users: GrowthUser[] = [];
  const allOrders: GrowthOrder[] = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const userId = `U${String(i + 1).padStart(4, "0")}`;
    const persona = rand();
    let firstOrderDays: number;
    let orderCount: number;
    let lastOrderDays: number;

    if (persona < 0.18) {
      firstOrderDays = randInt(rand, 1, 30);
      orderCount = rand() < 0.82 ? 1 : 2;
      lastOrderDays = orderCount === 1 ? firstOrderDays : randInt(rand, 0, firstOrderDays);
    } else if (persona < 0.32) {
      firstOrderDays = randInt(rand, 60, 360);
      orderCount = randInt(rand, 5, 14);
      lastOrderDays = randInt(rand, 0, 18);
    } else if (persona < 0.42) {
      firstOrderDays = randInt(rand, 90, 400);
      orderCount = randInt(rand, 5, 12);
      lastOrderDays = randInt(rand, 20, 50);
    } else if (persona < 0.55) {
      firstOrderDays = randInt(rand, 90, 500);
      orderCount = randInt(rand, 2, 6);
      lastOrderDays = randInt(rand, 50, 120);
    } else {
      firstOrderDays = randInt(rand, 20, 200);
      orderCount = randInt(rand, 2, 6);
      lastOrderDays = randInt(rand, 0, 35);
    }
    if (lastOrderDays > firstOrderDays) lastOrderDays = firstOrderDays;

    const firstOrderDate = addDays(asOf, -firstOrderDays);
    const preferredTime = pick(rand, MEAL_PERIODS);
    const channel = pick(rand, CHANNELS);
    const category = pick(rand, [...CATEGORIES]);
    const sensitivity = pick(rand, SENSITIVITIES);

    const orders = generateOrders(
      rand, userId, firstOrderDate, asOf, orderCount, preferredTime, channel, category
    );
    const forcedLast = addDays(asOf, -lastOrderDays);
    if (orders.length > 0) {
      orders[orders.length - 1]!.orderDate = forcedLast;
      orders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
      orders[0]!.orderDate = firstOrderDate;
      orders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
    }

    const totalSpend = Math.round(orders.reduce((s, o) => s + o.amount, 0) * 10) / 10;
    const avgOrderValue = orders.length > 0 ? Math.round((totalSpend / orders.length) * 10) / 10 : 0;
    const lastOrderDate = orders.length > 0 ? orders[orders.length - 1]!.orderDate : firstOrderDate;
    const recencyDays = daysBetween(lastOrderDate, asOf);
    const frequency = orders.length;
    const monetary = totalSpend;
    const ordersLast30 = orders.filter((o) => daysBetween(o.orderDate, asOf) <= 30).length;
    const ordersPrev60 = orders.filter((o) => {
      const d = daysBetween(o.orderDate, asOf);
      return d > 30 && d <= 90;
    }).length;
    const segmentId = assignSegment({
      recencyDays, frequency, monetary, firstOrderDays, ordersLast30, ordersPrev60,
    });

    users.push({
      userId,
      firstOrderDate,
      lastOrderDate,
      orderCount: frequency,
      totalSpend,
      avgOrderValue,
      favoriteCategory: category,
      preferredTime,
      couponSensitivity: sensitivity,
      channel,
      lifecycleStage: toLifecycle(segmentId, firstOrderDays),
      valueTier: toValueTier(monetary, frequency),
      recencyDays,
      frequency,
      monetary,
      segmentId,
      ordersLast30,
      ordersPrev60,
      tags: buildTags(segmentId, preferredTime, channel, sensitivity, category),
    });
    allOrders.push(...orders);
  }
  return { users, orders: allOrders };
}

function buildDemoCampaigns(users: GrowthUser[], asOf: string, newRepeatRate: number): GrowthCampaign[] {
  const targetUsers = users.filter((u) => {
    const d = daysBetween(u.firstOrderDate, asOf);
    return d >= 7 && d <= 14 && u.orderCount === 1;
  }).length;
  const reach = Math.round(targetUsers * 0.963);
  const claim = Math.round(reach * 0.353);
  const redemption = Math.round(claim * 0.44);
  const revenue = Math.round(redemption * 90);
  const cost = Math.round(claim * 8.8 + redemption * 5);
  const highValueDecline = users.filter(
    (u) => u.segmentId === "churn_risk" && (u.valueTier === "高价值" || u.ordersPrev60 >= 3)
  ).length;

  return [
    {
      campaignId: "CMP-001",
      campaignName: "新客7日复购提升计划",
      targetSegment: "首购7–14天未复购",
      opportunityId: "new_repeat_low",
      status: "已结束",
      targetUsers,
      benefit: "满50减10",
      channels: ["公众号", "企业微信"],
      sendTime: "周四 17:00",
      reach,
      claim,
      redemption,
      revenue,
      cost,
      repeatRateBefore: newRepeatRate,
      repeatRateAfter: Math.round((newRepeatRate + 4.2) * 10) / 10,
      startedAt: addDays(asOf, -14),
      endedAt: addDays(asOf, -7),
    },
    {
      campaignId: "CMP-002",
      campaignName: "高价值用户召回计划",
      targetSegment: "高价值活跃下降",
      opportunityId: "high_value_decline",
      status: "进行中",
      targetUsers: highValueDecline,
      benefit: "专属新品试吃券",
      channels: ["企业微信", "小程序"],
      sendTime: "周五 18:30",
      reach: Math.round(highValueDecline * 0.72),
      claim: Math.round(highValueDecline * 0.28),
      redemption: Math.round(highValueDecline * 0.12),
      revenue: Math.round(highValueDecline * 0.12 * 128),
      cost: Math.round(highValueDecline * 0.28 * 12),
      repeatRateBefore: 42,
      repeatRateAfter: 0,
      startedAt: addDays(asOf, -3),
      endedAt: null,
    },
  ];
}

export function getGrowthDataset(): GrowthDataset {
  if (cached) return cached;
  const asOfDate = GROWTH_AS_OF;
  const { users, orders } = buildUsersAndOrders(asOfDate);
  const newUsers30 = users.filter((u) => daysBetween(u.firstOrderDate, asOfDate) <= 30);
  const newRepeat =
    newUsers30.length > 0
      ? (newUsers30.filter((u) => u.orderCount >= 2).length / newUsers30.length) * 100
      : 0;
  cached = {
    asOfDate,
    users,
    orders,
    campaigns: buildDemoCampaigns(users, asOfDate, Math.round(newRepeat * 10) / 10),
  };
  return cached;
}

export function resetGrowthDatasetCache(): void {
  cached = null;
}
