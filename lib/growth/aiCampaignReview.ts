import "server-only";

import type { GrowthCampaign } from "@/types/growth";
import {
  generateCampaignReview,
  type CampaignReviewAI,
} from "./campaignReview";
import { callDeepSeekJson, isDeepSeekConfigured } from "./deepseekJson";

export type CampaignReviewResult = CampaignReviewAI & {
  source: "deepseek" | "rules";
};

const SYSTEM = `你是餐饮营销复盘顾问。根据活动实绩字段生成复盘分析与下一轮建议。
绝对规则：
1. 只能使用输入活动 JSON 中的数字与状态，禁止编造触达/核销/GMV/成本。
2. analysis 用中文 3–5 句：效果、渠道/窗口洞察、风险或亮点。
3. nextSteps 用中文 2–4 句：可执行的下一轮优化建议。
4. 不要改写 roi 与 roiFormula（由系统计算）。
5. 输出严格 JSON：{"analysis":"...","nextSteps":"..."}`;

export async function resolveCampaignReview(
  campaign: GrowthCampaign
): Promise<CampaignReviewResult> {
  const fallback = generateCampaignReview(campaign);

  if (!isDeepSeekConfigured()) {
    return { ...fallback, source: "rules" };
  }

  try {
    const raw = await callDeepSeekJson<{
      analysis?: string;
      nextSteps?: string;
    }>(
      SYSTEM,
      `活动实绩 JSON：\n${JSON.stringify(campaign, null, 2)}\n\n系统已计算 ROI=${fallback.roi}，公式：${fallback.roiFormula}\n\n规则复盘参考：\n${JSON.stringify({ analysis: fallback.analysis, nextSteps: fallback.nextSteps })}`
    );

    return {
      roi: fallback.roi,
      roiFormula: fallback.roiFormula,
      analysis:
        typeof raw.analysis === "string" && raw.analysis.trim()
          ? raw.analysis.trim()
          : fallback.analysis,
      nextSteps:
        typeof raw.nextSteps === "string" && raw.nextSteps.trim()
          ? raw.nextSteps.trim()
          : fallback.nextSteps,
      source: "deepseek",
    };
  } catch (error) {
    console.error("[growth AI campaign review fallback]", error);
    return { ...fallback, source: "rules" };
  }
}
