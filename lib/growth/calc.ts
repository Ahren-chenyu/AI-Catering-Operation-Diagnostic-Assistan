/** 纯计算函数 —— 避免循环依赖 */

export function calcRepeatRate(users: { orderCount: number }[]): number {
  if (users.length === 0) return 0;
  const repeaters = users.filter((u) => u.orderCount >= 2).length;
  return Math.round((repeaters / users.length) * 1000) / 10;
}

export function calcArpu(revenue: number, activeUsers: number): number {
  if (activeUsers === 0) return 0;
  return Math.round((revenue / activeUsers) * 10) / 10;
}

/** ROI = (活动收入 - 营销成本) / 营销成本 */
export function calcRoi(revenue: number, cost: number): number {
  if (cost <= 0) return 0;
  return Math.round(((revenue - cost) / cost) * 100) / 100;
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
