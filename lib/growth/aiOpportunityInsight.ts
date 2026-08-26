import "server-only";

import type { GrowthOpportunity } from "@/types/growth";
import { callDeepSeekJson, isDeepSeekConfigured } from "./deepseekJson";

export type OpportunityInsightResult = {
  headline: string;
  narrative: string;
  priorities: string[];
  source: "deepseek" | "rules";
};

function rulesInsight(
  opportunities: GrowthOpportunity[]
): OpportunityInsightResult {
  const top = opportunities[0];
  return {
    headline: top
      ? `今日优先关注：${top.title}`
      : "今日暂无高优先级增长机会",
    narrative: top
      ? `${top.judgment} 建议先处理「${top.targetUsers}」（约 ${top.targetUserCount} 人），目标：${top.growthGoal}。`
      : "规则引擎未命中异常阈值，可继续观察复购率、高价值活跃与午餐订单。",
    priorities: opportunities.slice(0, 3).map((o) => o.title),
    source: "rules",
  };
}

const SYSTEM = `你是餐饮增长机会解读顾问。根据规则引擎已识别的机会列表，输出今日增长解读。
绝对规则：
1. 只能使用输入机会中的 title/judgment/discovery/targetUserCount/growthGoal，禁止编造指标。
2. headline ≤ 30 字；narrative 2–4 句；priorities 最多 3 条（用机会标题）。
3. 输出严格 JSON：{"headline":"...","narrative":"...","priorities":["..."]}`;

export async function resolveOpportunityInsight(
  opportunities: GrowthOpportunity[]
): Promise<OpportunityInsightResult> {
  const fallback = rulesInsight(opportunities);

  if (!isDeepSeekConfigured() || opportunities.length === 0) {
    return fallback;
  }

  try {
    const raw = await callDeepSeekJson<{
      headline?: string;
      narrative?: string;
      priorities?: string[];
    }>(SYSTEM, `机会列表 JSON：\n${JSON.stringify(opportunities, null, 2)}`);

    return {
      headline:
        typeof raw.headline === "string" && raw.headline.trim()
          ? raw.headline.trim()
          : fallback.headline,
      narrative:
        typeof raw.narrative === "string" && raw.narrative.trim()
          ? raw.narrative.trim()
          : fallback.narrative,
      priorities:
        Array.isArray(raw.priorities) && raw.priorities.length > 0
          ? raw.priorities
              .filter((p): p is string => typeof p === "string")
              .slice(0, 3)
          : fallback.priorities,
      source: "deepseek",
    };
  } catch (error) {
    console.error("[growth AI opportunity insight fallback]", error);
    return fallback;
  }
}
