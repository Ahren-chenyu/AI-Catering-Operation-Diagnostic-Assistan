import type { GrowthCampaign } from "@/types/growth";
import { calcRoi } from "./calc";

export interface CampaignReviewAI {
  analysis: string;
  nextSteps: string;
  roi: number;
  roiFormula: string;
}

/** 基于活动实绩生成 AI 复盘（规则模板，引用真实字段） */
export function generateCampaignReview(
  campaign: GrowthCampaign
): CampaignReviewAI {
  const roi = calcRoi(campaign.revenue, campaign.cost);
  const lift =
    Math.round((campaign.repeatRateAfter - campaign.repeatRateBefore) * 10) /
    10;
  const claimRate =
    campaign.reach > 0
      ? Math.round((campaign.claim / campaign.reach) * 1000) / 10
      : 0;
  const redeemRate =
    campaign.claim > 0
      ? Math.round((campaign.redemption / campaign.claim) * 1000) / 10
      : 0;

  let analysis = "";
  if (campaign.opportunityId === "new_repeat_low") {
    analysis = `本次「${campaign.campaignName}」使目标用户复购率从 ${campaign.repeatRateBefore}% 提升至 ${campaign.repeatRateAfter}%，提升 ${lift} 个百分点。实际触达 ${campaign.reach} 人（目标 ${campaign.targetUsers}），领取率 ${claimRate}%，核销率 ${redeemRate}%。核销用户贡献 GMV ¥${campaign.revenue.toLocaleString("zh-CN")}，营销成本 ¥${campaign.cost.toLocaleString("zh-CN")}。从窗口期看，首购后 7–10 天触达的用户核销意愿通常高于 11–14 天，说明较早进行二次消费触达效果更好。`;
  } else if (campaign.opportunityId === "high_value_decline") {
    analysis = `「${campaign.campaignName}」针对 ${campaign.targetUsers} 名高价值活跃下降用户，当前触达 ${campaign.reach}、领取 ${campaign.claim}、核销 ${campaign.redemption}。活动仍在进行中，已贡献 GMV ¥${campaign.revenue.toLocaleString("zh-CN")}。专属权益对低价格敏感人群更有效，但需继续观察频次是否回升至下降前 80%。`;
  } else {
    analysis = `活动「${campaign.campaignName}」触达 ${campaign.reach}、核销 ${campaign.redemption}，GMV ¥${campaign.revenue.toLocaleString("zh-CN")}，成本 ¥${campaign.cost.toLocaleString("zh-CN")}，ROI ${roi}。领取率 ${claimRate}%、核销率 ${redeemRate}%，可作为下一轮预算分配的基准。`;
  }

  let nextSteps = "";
  if (campaign.opportunityId === "new_repeat_low") {
    nextSteps =
      "下一轮将目标人群进一步聚焦首购 7–10 天用户；对高客单价用户减少优惠力度，测试会员积分或新品权益；对高敏感用户保持轻量满减，做分组对照。";
  } else if (campaign.opportunityId === "high_value_decline") {
    nextSteps =
      "对已核销用户跟踪 14 日复购；未响应人群改用顾问式企微外呼+到店预约；避免连续发券导致权益通胀。";
  } else {
    nextSteps =
      "保留高核销渠道加大预算，淘汰低转化文案；下一轮增加对照组以验证权益力度。";
  }

  return {
    analysis,
    nextSteps,
    roi,
    roiFormula: "ROI = (活动收入 - 营销成本) / 营销成本",
  };
}
