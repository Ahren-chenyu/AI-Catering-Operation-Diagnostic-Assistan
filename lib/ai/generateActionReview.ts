import "server-only";

import {
  getDeepSeekClient,
  isDeepSeekConfigured,
} from "@/lib/ai/deepseek";
import type {
  ActionPlanViewModel,
  ActionReviewResult,
  RawDailyMetrics,
} from "@/types";

const LOW_TEMPERATURE = 0.2;

const SYSTEM_PROMPT = `【角色】
你是一个餐饮经营顾问AI，负责在行动方案执行周期结束后做复盘。

【任务】
根据行动方案与执行期间的经营数据，输出结构化复盘结论。

【绝对规则】
1. 只能使用输入中的行动方案与经营数据，不得编造。
2. 必须对照目标指标与复盘指标进行分析。
3. 若数据不足以判断效果，要明确说明数据不足。
4. 建议必须具体、可执行。

【输出格式】
必须严格输出以下 JSON，不要包含 markdown 代码块：
{
  "summary": "一句话复盘结论",
  "metricAnalysis": "执行期间关键指标变化分析",
  "goalAssessment": "对照目标指标的达成情况评估",
  "nextSteps": "下一步建议"
}`;

function buildUserPrompt(
  plan: ActionPlanViewModel,
  periodMetrics: RawDailyMetrics[],
  startedAt: string,
  endAt: string
): string {
  return `行动方案：
${JSON.stringify(plan, null, 2)}

执行期间：${startedAt} 至 ${endAt}

执行期间经营数据（按日）：
${JSON.stringify(periodMetrics, null, 2)}`;
}

function parseReviewResult(raw: unknown): ActionReviewResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("DeepSeek 返回的复盘内容不是有效 JSON 对象。");
  }

  const data = raw as Record<string, unknown>;
  const fields = ["summary", "metricAnalysis", "goalAssessment", "nextSteps"] as const;

  for (const field of fields) {
    if (typeof data[field] !== "string" || !data[field].toString().trim()) {
      throw new Error(`DeepSeek 返回的 JSON 缺少有效字段：${field}`);
    }
  }

  return {
    summary: (data.summary as string).trim(),
    metricAnalysis: (data.metricAnalysis as string).trim(),
    goalAssessment: (data.goalAssessment as string).trim(),
    nextSteps: (data.nextSteps as string).trim(),
    generatedAt: new Date().toISOString(),
  };
}

function buildFallbackReview(
  plan: ActionPlanViewModel,
  periodMetrics: RawDailyMetrics[]
): ActionReviewResult {
  const totalRevenue = periodMetrics.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = periodMetrics.reduce((sum, m) => sum + m.orders, 0);

  return {
    summary: `「${plan.title}」执行周期已结束，共收集 ${periodMetrics.length} 天经营数据。`,
    metricAnalysis: `执行期间累计营业额 ¥${totalRevenue.toLocaleString("zh-CN")}，累计订单 ${totalOrders} 单。复盘指标：${plan.reviewMetrics.join("、")}。`,
    goalAssessment: `目标指标：${plan.targetMetric}。请结合上述数据对照目标完成情况进行评估。`,
    nextSteps: "建议继续跟踪复盘指标，并根据数据变化决定是否调整行动方案。",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateActionReview(
  plan: ActionPlanViewModel,
  periodMetrics: RawDailyMetrics[],
  startedAt: string,
  endAt: string
): Promise<ActionReviewResult> {
  if (!isDeepSeekConfigured()) {
    return buildFallbackReview(plan, periodMetrics);
  }

  const openai = getDeepSeekClient();
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";

  const response = await openai.chat.completions.create({
    model,
    temperature: LOW_TEMPERATURE,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(plan, periodMetrics, startedAt, endAt),
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 返回了空内容。");
  }

  try {
    return parseReviewResult(JSON.parse(content));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("DeepSeek 返回的复盘内容不是有效 JSON。");
    }
    throw error;
  }
}
