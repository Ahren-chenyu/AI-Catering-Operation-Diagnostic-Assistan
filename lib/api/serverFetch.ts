import "server-only";

import {
  getActionPlanFallback,
  getDashboardFallback,
  getDiagnosisFallback,
} from "@/lib/api/fallbackData";
import type {
  ActionPlanApiResponse,
  DashboardApiResponse,
  DiagnosisApiResponse,
  PageDataResult,
} from "@/lib/api/apiTypes";
import { getDefaultQueryDate } from "@/lib/services/businessContextService";

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const url = `${getApiBaseUrl()}${path}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.warn(`[serverFetch] ${path} failed: HTTP ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[serverFetch] ${path} failed:`, error);
    return null;
  }
}

function defaultQuery(): string {
  const date = getDefaultQueryDate();
  return `?storeId=store-001&date=${encodeURIComponent(date)}`;
}

export async function fetchDashboardPageData(): Promise<
  PageDataResult<DashboardApiResponse>
> {
  const apiData = await fetchJson<DashboardApiResponse>(
    `/api/dashboard${defaultQuery()}`
  );

  if (apiData?.store && apiData?.metrics) {
    return { data: apiData, source: "api" };
  }

  return { data: getDashboardFallback(), source: "fallback" };
}

export async function fetchDiagnosisPageData(): Promise<
  PageDataResult<DiagnosisApiResponse>
> {
  const apiData = await fetchJson<DiagnosisApiResponse>(
    `/api/diagnosis${defaultQuery()}`
  );

  if (apiData?.store && apiData?.diagnosis) {
    return { data: apiData, source: "api" };
  }

  return { data: getDiagnosisFallback(), source: "fallback" };
}

export async function fetchActionPlanPageData(): Promise<
  PageDataResult<ActionPlanApiResponse>
> {
  const apiData = await fetchJson<ActionPlanApiResponse>(
    `/api/action-plan${defaultQuery()}`
  );

  if (apiData?.store && apiData?.plan) {
    return { data: apiData, source: "api" };
  }

  return { data: getActionPlanFallback(), source: "fallback" };
}
