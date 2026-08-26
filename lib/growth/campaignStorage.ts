import type { GrowthCampaign, OpportunityId } from "@/types/growth";
import { calcRoi } from "./calc";

const STORAGE_KEY = "growth-campaigns-v1";

export function loadLocalCampaigns(): GrowthCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GrowthCampaign[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalCampaign(campaign: GrowthCampaign): void {
  if (typeof window === "undefined") return;
  const existing = loadLocalCampaigns().filter(
    (c) => c.campaignId !== campaign.campaignId
  );
  existing.unshift(campaign);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function mergeCampaigns(
  demo: GrowthCampaign[],
  local: GrowthCampaign[]
): GrowthCampaign[] {
  const demoIds = new Set(demo.map((c) => c.campaignId));
  const extras = local.filter((c) => !demoIds.has(c.campaignId));
  return [...extras, ...demo];
}

export function createSimulatedCampaign(input: {
  opportunityId: OpportunityId;
  campaignName: string;
  targetSegment: string;
  targetUsers: number;
  benefit: string;
  channels: string[];
  sendTime: string;
  reach: number;
  claimRate: number;
  redemptionRate: number;
  gmv: number;
  cost: number;
  repeatRateBefore: number;
  asOfDate: string;
}): GrowthCampaign {
  const claim = Math.round(input.reach * (input.claimRate / 100));
  const redemption = Math.round(claim * (input.redemptionRate / 100));
  return {
    campaignId: `CMP-LOCAL-${Date.now()}`,
    campaignName: input.campaignName,
    targetSegment: input.targetSegment,
    opportunityId: input.opportunityId,
    status: "准备中",
    targetUsers: input.targetUsers,
    benefit: input.benefit,
    channels: input.channels,
    sendTime: input.sendTime,
    reach: input.reach,
    claim,
    redemption,
    revenue: input.gmv,
    cost: input.cost,
    repeatRateBefore: input.repeatRateBefore,
    repeatRateAfter: 0,
    startedAt: input.asOfDate,
    endedAt: null,
  };
}

export function campaignRoi(campaign: GrowthCampaign): number {
  return calcRoi(campaign.revenue, campaign.cost);
}
