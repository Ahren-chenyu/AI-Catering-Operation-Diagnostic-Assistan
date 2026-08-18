import type {
  ActionPlan,
  AIInsight,
  DailyMetrics,
  DiagnosisResult,
  RevenueMetrics,
  Store,
} from "@/types";

export interface DashboardApiResponse {
  store: Store;
  metrics: DailyMetrics;
  revenueStatus: RevenueMetrics;
  insights: AIInsight[];
  status: DiagnosisResult["status"];
}

export interface DiagnosisApiResponse {
  store: Store;
  metrics: DailyMetrics;
  diagnosis: DiagnosisResult;
}

export interface ActionPlanApiResponse {
  store: Store;
  plan: ActionPlan;
  diagnosisSummary: string;
  basedOn: {
    status: DiagnosisResult["status"];
    primaryCause: DiagnosisResult["primaryCause"];
    customerCause: DiagnosisResult["customerCause"];
  };
}

export type DataSource = "api" | "fallback";

export interface PageDataResult<T> {
  data: T;
  source: DataSource;
}
