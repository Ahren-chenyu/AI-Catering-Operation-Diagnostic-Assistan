import "server-only";

import {
  getActionPlanFallback,
  getDashboardFallback,
  getDiagnosisFallback,
} from "@/lib/api/fallbackData";
import {
  buildActionPlanResponse,
  buildDashboardResponse,
  buildDiagnosisResponse,
  getDefaultPageQuery,
} from "@/lib/api/pageDataService";
import type {
  ActionPlanApiResponse,
  DashboardApiResponse,
  DiagnosisApiResponse,
  PageDataResult,
} from "@/lib/api/apiTypes";

export async function fetchDashboardPageData(): Promise<
  PageDataResult<DashboardApiResponse>
> {
  const { storeId, date } = getDefaultPageQuery();

  try {
    const data = await buildDashboardResponse(storeId, date);
    if (data.store && data.metrics) {
      return { data, source: "api" };
    }
  } catch (error) {
    console.warn("[serverFetch] dashboard direct load failed:", error);
  }

  return { data: getDashboardFallback(), source: "fallback" };
}

export async function fetchDiagnosisPageData(): Promise<
  PageDataResult<DiagnosisApiResponse>
> {
  const { storeId, date } = getDefaultPageQuery();

  try {
    const data = await buildDiagnosisResponse(storeId, date);
    if (data.store && data.diagnosis) {
      return { data, source: "api" };
    }
  } catch (error) {
    console.warn("[serverFetch] diagnosis direct load failed:", error);
  }

  return { data: getDiagnosisFallback(), source: "fallback" };
}

export async function fetchActionPlanPageData(): Promise<
  PageDataResult<ActionPlanApiResponse>
> {
  const { storeId, date } = getDefaultPageQuery();

  try {
    const data = await buildActionPlanResponse(storeId, date);
    if (data.store && data.plan) {
      return { data, source: "api" };
    }
  } catch (error) {
    console.warn("[serverFetch] action-plan direct load failed:", error);
  }

  return { data: getActionPlanFallback(), source: "fallback" };
}
