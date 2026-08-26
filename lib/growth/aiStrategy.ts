import "server-only";

import type { GrowthOpportunity, MarketingStrategy } from "@/types/growth";
import { generateMarketingStrategy } from "./strategyEngine";
import { callDeepSeekJson, isDeepSeekConfigured } from "./deepseekJson";

export type MarketingStrategyResult = MarketingStrategy & {
  source: "deepseek" | "rules";
};

const SYSTEM = `你是餐饮用户增长策略顾问。在已有规则策略基础上，优化「解释文案与营销文案」。
绝对规则：
1. 不得修改目标人数、forecast 中任何数字、权益名称本身。
2. 可以优化：benefitReason、sendTimeReason、whyRecommended、channels[].reason、copySms、copyWechat、copyPush。
3. 文案必须针对目标人群与机会判断，避免空泛口号。
4. copySms ≤ 70 字；copyWechat 2–3 句；copyPush ≤ 28 字。
5. 输出严格 JSON：
{
  "benefitReason": "...",
  "sendTimeReason": "...",
  "whyRecommended": "...",
  "channels": [{"name":"...","reason":"..."}],
  "copySms": "...",
  "copyWechat": "...",
  "copyPush": "..."
}`;

export async function resolveMarketingStrategy(
  opportunity: GrowthOpportunity
): Promise<MarketingStrategyResult> {
  const fallback = generateMarketingStrategy(opportunity);

  if (!isDeepSeekConfigured()) {
    return { ...fallback, source: "rules" };
  }

  try {
    const raw = await callDeepSeekJson<{
      benefitReason?: string;
      sendTimeReason?: string;
      whyRecommended?: string;
      channels?: { name: string; reason: string }[];
      copySms?: string;
      copyWechat?: string;
      copyPush?: string;
    }>(
      SYSTEM,
      `增长机会：\n${JSON.stringify(opportunity, null, 2)}\n\n规则策略（请在此基础上增强文案）：\n${JSON.stringify(fallback, null, 2)}`
    );

    const channels =
      Array.isArray(raw.channels) &&
      raw.channels.length > 0 &&
      raw.channels.every(
        (c) =>
          c &&
          typeof c.name === "string" &&
          typeof c.reason === "string" &&
          c.name.trim() &&
          c.reason.trim()
      )
        ? raw.channels.map((c) => ({
            name: c.name.trim(),
            reason: c.reason.trim(),
          }))
        : fallback.channels;

    return {
      ...fallback,
      benefitReason:
        typeof raw.benefitReason === "string" && raw.benefitReason.trim()
          ? raw.benefitReason.trim()
          : fallback.benefitReason,
      sendTimeReason:
        typeof raw.sendTimeReason === "string" && raw.sendTimeReason.trim()
          ? raw.sendTimeReason.trim()
          : fallback.sendTimeReason,
      whyRecommended:
        typeof raw.whyRecommended === "string" && raw.whyRecommended.trim()
          ? raw.whyRecommended.trim()
          : fallback.whyRecommended,
      channels,
      copySms:
        typeof raw.copySms === "string" && raw.copySms.trim()
          ? raw.copySms.trim()
          : fallback.copySms,
      copyWechat:
        typeof raw.copyWechat === "string" && raw.copyWechat.trim()
          ? raw.copyWechat.trim()
          : fallback.copyWechat,
      copyPush:
        typeof raw.copyPush === "string" && raw.copyPush.trim()
          ? raw.copyPush.trim()
          : fallback.copyPush,
      source: "deepseek",
    };
  } catch (error) {
    console.error("[growth AI strategy fallback]", error);
    return { ...fallback, source: "rules" };
  }
}
