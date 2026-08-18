import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { parseApiQueryParams } from "@/lib/api/parseQueryParams";
import { getRevenueMetrics } from "@/lib/ai/getRevenueMetrics";
import { runDiagnosis } from "@/lib/ai/diagnosisEngine";
import {
  getDefaultQueryDate,
  loadBusinessContext,
} from "@/lib/services/businessContextService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { storeId, date } = parseApiQueryParams(
      new URL(request.url).searchParams,
      getDefaultQueryDate()
    );

    const context = await loadBusinessContext(storeId, date);
    const diagnosisContext = {
      metrics: context.metrics,
      baseline: context.baseline,
    };

    const revenueStatus = getRevenueMetrics(diagnosisContext);
    const diagnosis = runDiagnosis(diagnosisContext);

    return NextResponse.json({
      store: context.store,
      metrics: context.metrics,
      revenueStatus,
      insights: diagnosis.insights,
      status: diagnosis.status,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
