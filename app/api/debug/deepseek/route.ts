import { isDeepSeekConfigured, testDeepSeek } from "@/lib/ai/deepseek";
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
    const answer = await testDeepSeek();

    return NextResponse.json({
      ok: true,
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash",
      answer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "DeepSeek 请求失败，请稍后重试。";

    console.error("[DeepSeek test failed]", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 502 }
    );
  }
}
