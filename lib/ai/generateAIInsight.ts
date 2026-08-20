import "server-only";

import {
  getDeepSeekClient,
  isDeepSeekConfigured,
} from "@/lib/ai/deepseek";
import { withTimeout } from "@/lib/utils/withTimeout";
import type {
  AIInsightResult,
  DiagnosisResult,
  RecommendedAction,
} from "@/types";

const LOW_TEMPERATURE = 0.2;
const DEEPSEEK_TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = `【角色】
你是一个餐饮经营顾问AI。

【任务】
根据已有经营诊断结果，为餐饮老板解释当前问题，并给出可以执行的经营实验。

【绝对规则】
1. 只能使用输入 DiagnosisResult 中的事实。
2. 不允许编造输入中不存在的数据。
3. 不允许把 unknownFactors 中的未知因素说成确定原因。
4. 如果 unknownFactors 中存在营销数据缺失，不得声称「营销导致营业额下降」。
5. 不允许输出「加强营销」「提升服务」「优化运营」这种没有具体执行步骤的空泛建议。
6. 建议必须尽量包括：做什么、对谁做、做多久、观察什么。
7. 如果数据不足以支持具体方案，要明确说明数据不足，并给出低风险的验证实验。
8. 所有预算和预测数字如果不是输入中的事实，budget 字段必须包含「AI测算值」字样。

【输出格式】
必须严格输出以下 JSON 结构，不要包含 markdown 代码块或其他文字：
{
  "summary": "老板能看懂的一句话或两句话经营解释",
  "reasoning": "基于诊断事实的推理说明，引用输入中的已知事实与推断，不编造",
  "recommendedAction": {
    "title": "具体行动方案名称",
    "objective": "本次行动要验证或改善什么",
    "steps": ["可执行步骤1", "可执行步骤2", "可执行步骤3"],
    "duration": "执行周期，如 7 天",
    "budget": "预算说明，非事实数字须标注 AI测算值",
    "targetMetric": "核心观察指标",
    "reviewMetrics": ["复盘指标1", "复盘指标2"]
  }
}`;

function buildUserPrompt(diagnosis: DiagnosisResult): string {
  return `以下是系统已完成规则引擎计算后的 DiagnosisResult（JSON）。请仅基于此 JSON 生成经营解释与行动建议，不得访问或假设任何 JSON 之外的数据。

DiagnosisResult:
${JSON.stringify(diagnosis, null, 2)}`;
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`DeepSeek 返回的 JSON 缺少有效字段：${field}`);
  }
}

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((item) => typeof item === "string" && item.trim().length > 0)
  ) {
    throw new Error(`DeepSeek 返回的 JSON 缺少有效字段：${field}`);
  }
}

function parseRecommendedAction(raw: unknown): RecommendedAction {
  if (!raw || typeof raw !== "object") {
    throw new Error("DeepSeek 返回的 JSON 缺少 recommendedAction 对象。");
  }

  const action = raw as Record<string, unknown>;
  assertNonEmptyString(action.title, "recommendedAction.title");
  assertNonEmptyString(action.objective, "recommendedAction.objective");
  assertStringArray(action.steps, "recommendedAction.steps");
  assertNonEmptyString(action.duration, "recommendedAction.duration");
  assertNonEmptyString(action.budget, "recommendedAction.budget");
  assertNonEmptyString(action.targetMetric, "recommendedAction.targetMetric");
  assertStringArray(action.reviewMetrics, "recommendedAction.reviewMetrics");

  return {
    title: action.title.trim(),
    objective: action.objective.trim(),
    steps: action.steps.map((s) => s.trim()),
    duration: action.duration.trim(),
    budget: action.budget.trim(),
    targetMetric: action.targetMetric.trim(),
    reviewMetrics: action.reviewMetrics.map((s) => s.trim()),
  };
}

function parseAIInsightResult(raw: unknown): AIInsightResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("DeepSeek 返回的内容不是有效 JSON 对象。");
  }

  const data = raw as Record<string, unknown>;
  assertNonEmptyString(data.summary, "summary");
  assertNonEmptyString(data.reasoning, "reasoning");

  return {
    summary: data.summary.trim(),
    reasoning: data.reasoning.trim(),
    recommendedAction: parseRecommendedAction(data.recommendedAction),
  };
}

/**
 * 基于已有 DiagnosisResult 调用 DeepSeek，生成老板可读的经营解释与可执行建议。
 * 不访问数据库，仅消费规则引擎输出。
 */
export async function generateAIInsight(
  diagnosis: DiagnosisResult
): Promise<AIInsightResult> {
  if (!isDeepSeekConfigured()) {
    throw new Error("DEEPSEEK_API_KEY 未配置，无法生成 AI 经营建议。");
  }

  const openai = getDeepSeekClient();
  const model =
    process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";

  const response = await withTimeout(
    openai.chat.completions.create({
      model,
      temperature: LOW_TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(diagnosis) },
      ],
    }),
    DEEPSEEK_TIMEOUT_MS,
    "DeepSeek insight generation timed out"
  );

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 返回了空内容。");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("DeepSeek 返回的内容不是有效 JSON。");
  }

  return parseAIInsightResult(parsed);
}
