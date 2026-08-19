import { generateAIInsight } from "@/lib/ai/generateAIInsight";
import { isDeepSeekConfigured } from "@/lib/ai/deepseek";
import { runDiagnosis } from "@/lib/ai/diagnosisEngine";
import { blockDebugRouteInProduction } from "@/lib/api/debugRouteGuard";
import { NextResponse } from "next/server";

export async function GET() {
  const blocked = blockDebugRouteInProduction();
  if (blocked) return blocked;

  if (!isDeepSeekConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "DEEPSEEK_API_KEY 未配置。请在 .env.local 中设置后重启开发服务器。",
      },
      { status: 503 }
    );
  }

  try {
    const diagnosis = runDiagnosis();
    const aiInsight = await generateAIInsight(diagnosis);

    return NextResponse.json({
      ok: true,
      diagnosisInput: diagnosis,
      aiInsight,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 经营建议生成失败。";

    console.error("[generateAIInsight failed]", message);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}
