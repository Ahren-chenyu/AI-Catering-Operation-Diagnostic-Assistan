import "server-only";

import type { AIPortrait, GrowthUser } from "@/types/growth";
import { buildAIPortrait } from "./portrait";
import { callDeepSeekJson, isDeepSeekConfigured } from "./deepseekJson";

export type AIPortraitResult = AIPortrait & {
  source: "deepseek" | "rules";
};

const SYSTEM = `你是餐饮门店的用户增长顾问。根据给定用户字段生成 AI 用户画像。
绝对规则：
1. 只能使用输入 JSON 中的字段与数值，禁止编造订单、金额、日期、标签。
2. summary 用中文 2–4 句，说明用户价值、生命周期、近期行为变化与偏好。
3. bullets 恰好 4 条，每条简短可扫读，必须引用输入中的具体数字或标签。
4. 若近期频次下降，要明确写出下降幅度（用输入可算的数据）。
5. 输出严格 JSON：{"summary":"...","bullets":["...","...","...","..."]}`;

export async function resolveAIPortrait(
  user: GrowthUser,
  asOfDate: string
): Promise<AIPortraitResult> {
  const fallback = buildAIPortrait(user, asOfDate);

  if (!isDeepSeekConfigured()) {
    return { ...fallback, source: "rules" };
  }

  try {
    const raw = await callDeepSeekJson<{
      summary?: string;
      bullets?: string[];
    }>(
      SYSTEM,
      `数据截止日：${asOfDate}\n用户JSON：\n${JSON.stringify(user, null, 2)}\n\n规则引擎参考画像（可改写但不得与数据冲突）：\n${JSON.stringify(fallback)}`
    );

    const summary =
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : fallback.summary;
    const bullets =
      Array.isArray(raw.bullets) &&
      raw.bullets.length > 0 &&
      raw.bullets.every((b) => typeof b === "string" && b.trim())
        ? raw.bullets.map((b) => b.trim()).slice(0, 6)
        : fallback.bullets;

    return { summary, bullets, source: "deepseek" };
  } catch (error) {
    console.error("[growth AI portrait fallback]", error);
    return { ...fallback, source: "rules" };
  }
}
