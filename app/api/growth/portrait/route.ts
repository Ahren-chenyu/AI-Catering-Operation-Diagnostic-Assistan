import { NextResponse } from "next/server";
import { resolveAIPortrait } from "@/lib/growth/aiPortrait";
import { getUserById } from "@/lib/growth/metrics";
import { GROWTH_AS_OF } from "@/lib/growth/dataset";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "缺少 userId" }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const portrait = await resolveAIPortrait(user, GROWTH_AS_OF);
    return NextResponse.json({ portrait, asOfDate: GROWTH_AS_OF });
  } catch (error) {
    console.error("[api/growth/portrait]", error);
    return NextResponse.json({ error: "生成 AI 画像失败" }, { status: 500 });
  }
}
