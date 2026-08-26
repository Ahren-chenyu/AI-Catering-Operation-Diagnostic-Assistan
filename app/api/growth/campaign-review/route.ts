import { NextResponse } from "next/server";
import { resolveCampaignReview } from "@/lib/growth/aiCampaignReview";
import type { GrowthCampaign } from "@/types/growth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { campaign?: GrowthCampaign };
    if (!body.campaign?.campaignId) {
      return NextResponse.json({ error: "缺少 campaign" }, { status: 400 });
    }

    const review = await resolveCampaignReview(body.campaign);
    return NextResponse.json({ review });
  } catch (error) {
    console.error("[api/growth/campaign-review]", error);
    return NextResponse.json(
      { error: "生成 AI 复盘失败" },
      { status: 500 }
    );
  }
}
