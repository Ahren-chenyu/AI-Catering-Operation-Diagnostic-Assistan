import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { generateActionReview } from "@/lib/ai/generateActionReview";
import { toDateString } from "@/lib/action/parseDurationDays";
import { getDailyMetricsInRange } from "@/lib/services/dataProvider";
import type { ActionPlanViewModel } from "@/types";
import { NextResponse } from "next/server";

interface ActionReviewRequestBody {
  storeId: string;
  roundId: string;
  startedAt: string;
  endAt: string;
  plan: ActionPlanViewModel;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionReviewRequestBody;
    const { storeId, startedAt, endAt, plan } = body;

    if (!storeId || !startedAt || !endAt || !plan?.title) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const startDate = toDateString(startedAt);
    const endDate = toDateString(endAt);
    const periodMetrics = await getDailyMetricsInRange(
      storeId,
      startDate,
      endDate
    );

    if (periodMetrics.length === 0) {
      return NextResponse.json({
        reviewStatus: "no_data" as const,
        review: null,
      });
    }

    const review = await generateActionReview(
      plan,
      periodMetrics,
      startedAt,
      endAt
    );

    return NextResponse.json({
      reviewStatus: "completed" as const,
      review,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
