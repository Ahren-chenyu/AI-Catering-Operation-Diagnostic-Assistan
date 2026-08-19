export interface Store {
  id: string;
  name: string;
  type: string;
}

/** 源数据：仅包含当日原始经营指标（不含变化率） */
export interface RawDailyMetrics {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
}

/** 历史同期基线，用于计算变化率 */
export interface HistoricalBaseline {
  revenueAverage: number;
  ordersAverage: number;
  averageOrderValueAverage: number;
  newCustomersAverage: number;
  returningCustomersAverage: number;
}

/** 派生指标：原始值 + 计算后的变化率 */
export interface DailyMetrics extends RawDailyMetrics {
  revenueChange: number;
  ordersChange: number;
  averageOrderValueChange: number;
  newCustomersChange: number;
  returningCustomersChange: number;
}

export type InsightType = "anomaly" | "judgment" | "evidence" | "unknown";
export type Severity = "critical" | "warning" | "info";

export interface AIInsight {
  type: InsightType;
  title: string;
  description: string;
  evidence: string[];
  severity: Severity;
}

export interface EvidenceItem {
  label: string;
  value: string;
  change?: number;
  source: "known" | "inferred" | "unknown";
}

export interface DiagnosisStep {
  level: number;
  title: string;
  conclusion: string;
  evidence: EvidenceItem[];
}

export interface ActionPlan {
  title: string;
  coreProblem: string;
  reason: string;
  duration: string;
  budget: string;
  budgetNote: string;
  target: string;
  coreMetrics: string[];
  reviewMetrics: string[];
}

export interface RevenueMetrics {
  revenue: number;
  revenueChange: number;
  yoyChange: number;
  momChange: number;
  historicalAverage: number;
  isAnomaly: boolean;
}

export interface OrderMetrics {
  orders: number;
  ordersChange: number;
  yoyChange: number;
  momChange: number;
}

export interface CustomerMetrics {
  newCustomers: number;
  newCustomersChange: number;
  returningCustomers: number;
  returningCustomersChange: number;
}

/** 业务上下文：API / Service 层从 dataProvider 加载后传入计算与诊断模块 */
export interface BusinessContext {
  store: Store;
  rawMetrics: RawDailyMetrics;
  baseline: HistoricalBaseline;
  metrics: DailyMetrics;
}

export interface DiagnosisContext {
  metrics: DailyMetrics;
  baseline: HistoricalBaseline;
}

export interface DiagnosisInference {
  text: string;
  evidence: EvidenceItem[];
}

export interface DiagnosisResult {
  status: "normal" | "anomaly";
  currentProblem: string;
  primaryCause: "orders" | "aov" | "both" | "none";
  customerCause: "new" | "returning" | "both" | "none";
  summary: string;
  facts: EvidenceItem[];
  inferences: DiagnosisInference[];
  steps: DiagnosisStep[];
  insights: AIInsight[];
  unknownFactors: string[];
}

/** DeepSeek 基于 DiagnosisResult 生成的结构化经营建议 */
export interface RecommendedAction {
  title: string;
  objective: string;
  steps: string[];
  duration: string;
  budget: string;
  targetMetric: string;
  reviewMetrics: string[];
}

export interface AIInsightResult {
  summary: string;
  reasoning: string;
  recommendedAction: RecommendedAction;
}

/** 当天诊断快照 payload：规则层 + DeepSeek 结果 */
export interface DiagnosisSnapshotPayload {
  diagnosis: DiagnosisResult;
  aiInsight: AIInsightResult | null;
}

/** Action Plan 页面展示模型（DeepSeek 或规则引擎 fallback） */
export interface ActionPlanViewModel {
  source: "deepseek" | "rules";
  coreProblem: string;
  title: string;
  reason: string;
  steps: string[];
  duration: string;
  budget: string;
  budgetNote: string;
  targetMetric: string;
  targetNote?: string;
  reviewMetrics: string[];
}

/** 行动轮次记录 */
export interface ActionRoundRecord {
  id: string;
  storeId: string;
  startedAt: string;
  endAt: string;
  durationLabel: string;
  plan: ActionPlanViewModel;
  reviewStatus: "in_progress" | "no_data" | "completed";
  review: ActionReviewResult | null;
}

/** AI 自动复盘结果 */
export interface ActionReviewResult {
  summary: string;
  metricAnalysis: string;
  goalAssessment: string;
  nextSteps: string;
  generatedAt: string;
}
