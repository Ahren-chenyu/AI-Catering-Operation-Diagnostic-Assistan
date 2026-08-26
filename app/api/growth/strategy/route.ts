import { NextResponse } from "next/server";
import { resolveMarketingStrategy } from "@/lib/growth/aiStrategy";
import { getGrowthDashboardData } from "@/lib/growth/metrics";
import type { OpportunityId } from "@/types/growth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { opportunityId?: string };
    const opportunityId = body.opportunityId?.trim() as OpportunityId | undefined;
    if (!opportunityId) {
      return NextResponse.json({ error: "缺少 opportunityId" }, { status: 400 });
    }

    const data = getGrowthDashboardData();
    let opportunity = data.opportunities.find((o) => o.id === opportunityId);

    if (!opportunity) {
      opportunity = {
        id: opportunityId,
        title: "增长策略",
        severity: "info",
        discovery: ["当前规则未强触发该机会，仍可生成策略模板。"],
        judgment: "用于策略结构演示。",
        targetUsers: "相关目标人群",
        targetUserCount: 0,
        growthGoal: "验证营销策略结构",
        ctaLabel: "生成增长方案",
        evidenceMetrics: {},
      };
    }

    const strategy = await resolveMarketingStrategy(opportunity);
    return NextResponse.json({ strategy, opportunity });
  } catch (error) {
    console.error("[api/growth/strategy]", error);
    return NextResponse.json(
      { error: "生成 AI 策略失败" },
      { status: 500 }
    );
  }
}
