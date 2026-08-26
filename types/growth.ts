/** 用户增长模块领域类型 —— 全项目唯一数据契约 */

export type CouponSensitivity = "高" | "中" | "低";
export type LifecycleStage = "新客" | "成长期" | "成熟用户" | "沉睡用户" | "流失风险";
export type ValueTier = "高价值" | "中价值" | "低价值";
export type MealPeriod = "午餐" | "晚餐" | "夜宵";
export type Channel = "堂食" | "外卖" | "美团" | "抖音" | "小程序";

export type SegmentId =
  | "high_value"
  | "potential"
  | "new"
  | "dormant"
  | "churn_risk";

export type OpportunityId =
  | "new_repeat_low"
  | "high_value_decline"
  | "lunch_growth"
  | "arpu_lift"
  | "growth_quality";

export type CampaignStatus = "准备中" | "进行中" | "已结束";

export interface GrowthUser {
  userId: string;
  firstOrderDate: string;
  lastOrderDate: string;
  orderCount: number;
  totalSpend: number;
  avgOrderValue: number;
  favoriteCategory: string;
  preferredTime: MealPeriod;
  couponSensitivity: CouponSensitivity;
  channel: Channel;
  lifecycleStage: LifecycleStage;
  valueTier: ValueTier;
  recencyDays: number;
  frequency: number;
  monetary: number;
  segmentId: SegmentId;
  ordersLast30: number;
  ordersPrev60: number;
  tags: string[];
}

export interface GrowthOrder {
  orderId: string;
  userId: string;
  orderDate: string;
  amount: number;
  channel: Channel;
  mealPeriod: MealPeriod;
  category: string;
}

export interface GrowthCampaign {
  campaignId: string;
  campaignName: string;
  targetSegment: string;
  opportunityId: OpportunityId;
  status: CampaignStatus;
  targetUsers: number;
  benefit: string;
  channels: string[];
  sendTime: string;
  reach: number;
  claim: number;
  redemption: number;
  revenue: number;
  cost: number;
  repeatRateBefore: number;
  repeatRateAfter: number;
  startedAt: string;
  endedAt: string | null;
}

export interface GrowthKpi {
  key: string;
  label: string;
  value: number;
  displayValue: string;
  change: number;
  explanation: string;
  isAnomaly: boolean;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface MonthlyTrendPoint {
  month: string;
  value: number;
}

export interface SegmentSummary {
  id: SegmentId;
  name: string;
  description: string;
  strategy: string;
  userCount: number;
  share: number;
  arpu: number;
  repeatRate: number;
  status: "健康" | "关注" | "风险";
  recommendedAction: string;
}

export interface GrowthOpportunity {
  id: OpportunityId;
  title: string;
  severity: "critical" | "warning" | "info";
  discovery: string[];
  judgment: string;
  targetUsers: string;
  targetUserCount: number;
  growthGoal: string;
  ctaLabel: string;
  evidenceMetrics: Record<string, number | string>;
}

export interface MarketingStrategy {
  opportunityId: OpportunityId;
  goal: string;
  targetAudience: string;
  targetUserCount: number;
  userTraits: string[];
  benefit: string;
  benefitReason: string;
  channels: { name: string; reason: string }[];
  sendTime: string;
  sendTimeReason: string;
  whyRecommended: string;
  copySms: string;
  copyWechat: string;
  copyPush: string;
  forecast: {
    reach: number;
    claimRate: number;
    redemptionRate: number;
    repeatUsers: number;
    gmv: number;
    cost: number;
    roi: number;
  };
  disclaimer: string;
}

export interface GrowthDataset {
  asOfDate: string;
  users: GrowthUser[];
  orders: GrowthOrder[];
  campaigns: GrowthCampaign[];
}

export interface GrowthDashboardData {
  asOfDate: string;
  kpis: GrowthKpi[];
  newUserTrend: TrendPoint[];
  activeUserTrend: TrendPoint[];
  repeatRateTrend: MonthlyTrendPoint[];
  arpuTrend: MonthlyTrendPoint[];
  opportunities: GrowthOpportunity[];
  segments: SegmentSummary[];
}

export interface AIPortrait {
  summary: string;
  bullets: string[];
}
