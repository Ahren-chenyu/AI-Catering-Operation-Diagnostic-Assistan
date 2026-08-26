import type { GrowthCampaign, OpportunityId } from "@/types/growth";
import { getGrowthDataset } from "./dataset";
import { generateMarketingStrategy } from "./strategyEngine";
import { getGrowthDashboardData } from "./metrics";

export type { CampaignReviewAI } from "./campaignReview";
export { generateCampaignReview } from "./campaignReview";

export function getCampaigns(): GrowthCampaign[] {
  return getGrowthDataset().campaigns;
}

export function getCampaignById(id: string): GrowthCampaign | undefined {
  return getCampaigns().find((c) => c.campaignId === id);
}

/** 由策略创建模拟营销任务（服务端预览用；前端会再写入 localStorage） */
export function buildCampaignFromStrategy(
  opportunityId: OpportunityId,
  name?: string
): GrowthCampaign | null {
  const data = getGrowthDashboardData();
  const opportunity = data.opportunities.find((o) => o.id === opportunityId);
  if (!opportunity) return null;

  const strategy = generateMarketingStrategy(opportunity);
  const f = strategy.forecast;

  return {
    campaignId: `CMP-LOCAL-${opportunityId}`,
    campaignName: name ?? `${opportunity.title}执行计划`,
    targetSegment: strategy.targetAudience,
    opportunityId,
    status: "准备中",
    targetUsers: strategy.targetUserCount,
    benefit: strategy.benefit,
    channels: strategy.channels.map((c) => c.name),
    sendTime: strategy.sendTime,
    reach: f.reach,
    claim: Math.round(f.reach * (f.claimRate / 100)),
    redemption: f.repeatUsers,
    revenue: f.gmv,
    cost: f.cost,
    repeatRateBefore: Number(opportunity.evidenceMetrics.repeatRate ?? 0),
    repeatRateAfter: 0,
    startedAt: data.asOfDate,
    endedAt: null,
  };
}
