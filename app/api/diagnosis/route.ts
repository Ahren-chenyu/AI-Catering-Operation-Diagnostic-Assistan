import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { parseApiQueryParams } from "@/lib/api/parseQueryParams";
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
    const diagnosis = runDiagnosis({
      metrics: context.metrics,
      baseline: context.baseline,
    });

    return NextResponse.json({
      store: context.store,
      metrics: context.metrics,
      diagnosis,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
