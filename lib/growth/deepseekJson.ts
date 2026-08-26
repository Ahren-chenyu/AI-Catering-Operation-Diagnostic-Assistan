import { getDeepSeekClient, isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { withTimeout } from "@/lib/utils/withTimeout";

const TIMEOUT_MS = 25000;
const TEMPERATURE = 0.3;

/**
 * 调用 DeepSeek 并解析 JSON。
 * 未配置 API Key 时抛错，由调用方回退规则引擎。
 */
export async function callDeepSeekJson<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  if (!isDeepSeekConfigured()) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  const openai = getDeepSeekClient();
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";

  const response = await withTimeout(
    openai.chat.completions.create({
      model,
      temperature: TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
    TIMEOUT_MS,
    "DeepSeek growth AI timed out"
  );

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 返回空内容");
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("DeepSeek 返回的内容不是有效 JSON");
  }
}

export { isDeepSeekConfigured };
