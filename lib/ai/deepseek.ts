import "server-only";

import OpenAI from "openai";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";

let client: OpenAI | null = null;

function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置，请在服务端环境变量中设置。");
  }
  return apiKey;
}

function getDeepSeekModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL;
}

/** 仅服务端使用的 DeepSeek 客户端（OpenAI 兼容接口） */
export function getDeepSeekClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: DEEPSEEK_BASE_URL,
      apiKey: getDeepSeekApiKey(),
    });
  }
  return client;
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

/** 最小连通性测试：向 DeepSeek 发送一条固定问题 */
export async function testDeepSeek(): Promise<string> {
  const openai = getDeepSeekClient();
  const model = getDeepSeekModel();

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: "请用一句话说明：为什么餐饮SaaS需要AI经营诊断？",
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek 返回了空内容。");
  }

  return content;
}
