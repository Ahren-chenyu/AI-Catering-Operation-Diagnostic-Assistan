import { apiErrorResponse } from "@/lib/api/apiErrorResponse";
import { buildDashboardResponse } from "@/lib/api/pageDataService";
import { parseApiQueryParams } from "@/lib/api/parseQueryParams";
import {
  getDefaultQueryDate,
} from "@/lib/services/businessContextService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { storeId, date } = parseApiQueryParams(
      new URL(request.url).searchParams,
      getDefaultQueryDate()
    );

    return NextResponse.json(await buildDashboardResponse(storeId, date));
  } catch (error) {
    return apiErrorResponse(error);
  }
}
