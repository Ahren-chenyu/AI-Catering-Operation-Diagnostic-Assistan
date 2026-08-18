import type { HistoricalBaseline, RawDailyMetrics, Store } from "@/types";

export const store: Store = {
  id: "store-001",
  name: "XX烧烤店",
  type: "烧烤",
};

/** 当日基础经营数据（不含变化率） */
export const todayMetrics: RawDailyMetrics = {
  date: "2026-08-18",
  revenue: 28000,
  orders: 1200,
  averageOrderValue: 80,
  newCustomers: 230,
  returningCustomers: 500,
};

/** 历史同期基线数据 */
export const historicalBaseline: HistoricalBaseline = {
  revenueAverage: 33600,
  ordersAverage: 1445,
  averageOrderValueAverage: 70.8,
  newCustomersAverage: 403,
  returningCustomersAverage: 901,
};

export const channelBreakdown = [
  { channel: "堂食", orders: 712, change: -12.4 },
  { channel: "外卖", orders: 470, change: -26.8 },
];

export const mealBreakdown = [
  { period: "午餐", orders: 398, change: -14.2 },
  { period: "晚餐", orders: 784, change: -20.1 },
];

export const topDishes = [
  { name: "招牌烤串套餐", orders: 186, change: -8.5 },
  { name: "双人畅享套餐", orders: 142, change: -31.2 },
  { name: "工作日午餐套餐", orders: 98, change: -38.6 },
];
