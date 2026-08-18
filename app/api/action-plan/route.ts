import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { parseApiQueryParams } from "@/lib/api/parseQueryParams";
import { generateActionPlan } from "@/lib/ai/generateActionPlan";
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

    const diagnosis = runDiagnosis(diagnosisContext);
    const plan = generateActionPlan(diagnosisContext);

    return NextResponse.json({
      store: context.store,
      plan,
      diagnosisSummary: diagnosis.summary,
      basedOn: {
        status: diagnosis.status,
        primaryCause: diagnosis.primaryCause,
        customerCause: diagnosis.customerCause,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
