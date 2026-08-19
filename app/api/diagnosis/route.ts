import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { parseApiQueryParams } from "@/lib/api/parseQueryParams";
import {
  getDefaultQueryDate,
} from "@/lib/services/businessContextService";
import { getOrCreateDailyDiagnosisSnapshot } from "@/lib/services/dailyDiagnosisSnapshotService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { storeId, date } = parseApiQueryParams(
      new URL(request.url).searchParams,
      getDefaultQueryDate()
    );

    const snapshot = await getOrCreateDailyDiagnosisSnapshot(storeId, date);

    return NextResponse.json({
      store: snapshot.store,
      metrics: snapshot.metrics,
      diagnosis: snapshot.diagnosis,
      aiInsight: snapshot.aiInsight,
      fromSnapshot: snapshot.fromSnapshot,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
