import {
  historicalBaseline as mockHistoricalBaseline,
} from "@/lib/data/mockData";
import { getTodayMetrics } from "@/lib/metrics/calculateMetrics";
import { formatChange } from "@/lib/utils";
import {
  DEMO_ANOMALY_THRESHOLD,
  DEMO_SIGNIFICANT_CHANGE_THRESHOLD,
} from "./diagnosisConfig";
import { getCustomerMetrics } from "./getCustomerMetrics";
import { getRevenueMetrics } from "./getRevenueMetrics";
import type {
  DailyMetrics,
  DiagnosisContext,
  DiagnosisInference,
  DiagnosisResult,
  DiagnosisStep,
  EvidenceItem,
  HistoricalBaseline,
} from "@/types";

function resolveContext(context?: DiagnosisContext): {
  metrics: DailyMetrics;
  baseline: HistoricalBaseline;
} {
  if (context) {
    return context;
  }

  return {
    metrics: getTodayMetrics(),
    baseline: mockHistoricalBaseline,
  };
}

function buildKnownFacts(
  metrics: DailyMetrics,
  baseline: HistoricalBaseline
): EvidenceItem[] {
  return [
    {
      label: "今日营业额",
      value: `¥${metrics.revenue.toLocaleString()}`,
      change: metrics.revenueChange,
      source: "known",
    },
    {
      label: "历史同期营业额均值",
      value: `¥${baseline.revenueAverage.toLocaleString()}`,
      source: "known",
    },
    {
      label: "订单量",
      value: `${metrics.orders} 单`,
      change: metrics.ordersChange,
      source: "known",
    },
    {
      label: "客单价",
      value: `¥${metrics.averageOrderValue}`,
      change: metrics.averageOrderValueChange,
      source: "known",
    },
    {
      label: "新客",
      value: `${metrics.newCustomers} 人`,
      change: metrics.newCustomersChange,
      source: "known",
    },
    {
      label: "老客",
      value: `${metrics.returningCustomers} 人`,
      change: metrics.returningCustomersChange,
      source: "known",
    },
  ];
}

function buildUnknownFactors(): string[] {
  return [
    "当前系统缺少营销活动数据，因此无法判断营销活动是否影响营业额。",
    "当前系统缺少天气数据，因此无法判断天气是否影响营业额。",
    "当前系统缺少竞品与商圈客流数据，因此无法判断外部环境是否影响营业额。",
  ];
}

function buildInferenceEvidence(metrics: DailyMetrics): EvidenceItem[] {
  return [
    {
      label: "营业额变化",
      value: formatChange(metrics.revenueChange),
      source: "inferred",
    },
    {
      label: "订单量变化",
      value: formatChange(metrics.ordersChange),
      source: "inferred",
    },
    {
      label: "客单价变化",
      value: formatChange(metrics.averageOrderValueChange),
      source: "inferred",
    },
  ];
}

function analyzeRevenueDecomposition(
  metrics: DailyMetrics
): { conclusion: string; primaryCause: DiagnosisResult["primaryCause"] } {
  const ordersMag = Math.abs(metrics.ordersChange);
  const aovMag = Math.abs(metrics.averageOrderValueChange);
  const ordersDeclining =
    metrics.ordersChange <= -DEMO_SIGNIFICANT_CHANGE_THRESHOLD;
  const aovDeclining =
    metrics.averageOrderValueChange <= -DEMO_SIGNIFICANT_CHANGE_THRESHOLD;

  if (ordersDeclining && aovDeclining) {
    if (ordersMag > aovMag) {
      return {
        conclusion: "当前营业额下降主要来自订单量变化。",
        primaryCause: "orders",
      };
    }
    if (aovMag > ordersMag) {
      return {
        conclusion: "当前营业额下降主要来自客单价变化。",
        primaryCause: "aov",
      };
    }
    return {
      conclusion: "订单量和客单价均出现下降，需要进一步判断主要影响因素。",
      primaryCause: "both",
    };
  }

  if (
    ordersDeclining &&
    (!aovDeclining || ordersMag > aovMag)
  ) {
    return {
      conclusion: "当前营业额下降主要来自订单量变化。",
      primaryCause: "orders",
    };
  }

  if (
    aovDeclining &&
    (!ordersDeclining || aovMag > ordersMag)
  ) {
    return {
      conclusion: "当前营业额下降主要来自客单价变化。",
      primaryCause: "aov",
    };
  }

  return {
    conclusion: `当前营业额出现波动，订单量变化 ${formatChange(metrics.ordersChange)}，客单价变化 ${formatChange(metrics.averageOrderValueChange)}，需结合更多维度观察。`,
    primaryCause: "none",
  };
}

function analyzeCustomerDecomposition(
  customers: ReturnType<typeof getCustomerMetrics>
): { conclusion: string; customerCause: DiagnosisResult["customerCause"] } {
  const newMag = Math.abs(customers.newCustomersChange);
  const retMag = Math.abs(customers.returningCustomersChange);
  const newDeclining = customers.newCustomersChange < 0;
  const retDeclining = customers.returningCustomersChange < 0;

  if (newDeclining && retDeclining) {
    if (newMag > retMag) {
      return {
        conclusion: "新客数量下降是当前订单量下降的主要观察方向。",
        customerCause: "new",
      };
    }
    if (retMag > newMag) {
      return {
        conclusion: "老客数量下降是当前订单量下降的主要观察方向。",
        customerCause: "returning",
      };
    }
    return {
      conclusion: "新客和老客均出现下降，需要进一步观察整体客流变化。",
      customerCause: "both",
    };
  }

  if (newDeclining) {
    return {
      conclusion: "新客数量下降是当前订单量下降的主要观察方向。",
      customerCause: "new",
    };
  }

  if (retDeclining) {
    return {
      conclusion: "老客数量下降是当前订单量下降的主要观察方向。",
      customerCause: "returning",
    };
  }

  return {
    conclusion:
      "新客与老客数量未同步下降，订单量变化可能来自其他尚未接入的数据维度。",
    customerCause: "none",
  };
}

function buildSummary(
  status: DiagnosisResult["status"],
  inferences: DiagnosisInference[]
): string {
  if (status === "normal") {
    return "当前营业额处于正常波动范围。";
  }
  if (inferences.length === 0) {
    return "营业额出现异常波动，建议继续观察并补充更多经营维度数据。";
  }
  return inferences.map((item) => item.text).join(" ");
}

export function runDiagnosis(context?: DiagnosisContext): DiagnosisResult {
  const { metrics, baseline } = resolveContext(context);
  const diagnosisContext: DiagnosisContext = { metrics, baseline };
  const revenue = getRevenueMetrics(diagnosisContext);
  const customers = getCustomerMetrics(metrics);

  const facts = buildKnownFacts(metrics, baseline);
  const unknownFactors = buildUnknownFactors();
  const inferences: DiagnosisInference[] = [];
  const steps: DiagnosisStep[] = [];

  const layer1Evidence: EvidenceItem[] = [
    {
      label: "今日营业额",
      value: `¥${metrics.revenue.toLocaleString()}`,
      change: metrics.revenueChange,
      source: "known",
    },
    {
      label: "历史同期营业额均值",
      value: `¥${baseline.revenueAverage.toLocaleString()}`,
      source: "known",
    },
    {
      label: "营业额变化率",
      value: formatChange(metrics.revenueChange),
      source: "known",
    },
    {
      label: "Demo 异常阈值",
      value: `±${DEMO_ANOMALY_THRESHOLD}%`,
      source: "known",
    },
  ];

  if (!revenue.isAnomaly) {
    const normalConclusion = "当前营业额处于正常波动范围。";

    steps.push({
      level: 1,
      title: "营业额异常检测",
      conclusion: normalConclusion,
      evidence: layer1Evidence,
    });

    return {
      status: "normal",
      currentProblem: normalConclusion,
      primaryCause: "none",
      customerCause: "none",
      summary: normalConclusion,
      facts,
      inferences: [],
      steps,
      insights: [
        {
          type: "anomaly",
          title: "经营状态",
          description: `当前营业额较历史同期变化 ${formatChange(revenue.revenueChange)}，处于 Demo 正常波动范围（阈值 ±${DEMO_ANOMALY_THRESHOLD}%）。`,
          evidence: [
            `今日营业额 ¥${revenue.revenue.toLocaleString()}，历史同期均值 ¥${revenue.historicalAverage.toLocaleString()}`,
            `较历史同期变化 ${formatChange(revenue.revenueChange)}`,
          ],
          severity: "info",
        },
      ],
      unknownFactors,
    };
  }

  const direction =
    revenue.revenueChange < 0 ? "下降" : revenue.revenueChange > 0 ? "上升" : "持平";
  const currentProblem = `今日营业额较历史同期${direction} ${formatChange(revenue.revenueChange)}，已超过 Demo 异常阈值（±${DEMO_ANOMALY_THRESHOLD}%）。`;

  steps.push({
    level: 1,
    title: "营业额异常检测",
    conclusion: currentProblem,
    evidence: layer1Evidence,
  });

  let primaryCause: DiagnosisResult["primaryCause"] = "none";
  let customerCause: DiagnosisResult["customerCause"] = "none";

  if (revenue.revenueChange < 0) {
    const decomposition = analyzeRevenueDecomposition(metrics);
    primaryCause = decomposition.primaryCause;

    const layer2Evidence: EvidenceItem[] = [
      {
        label: "订单量",
        value: `${metrics.orders} 单`,
        change: metrics.ordersChange,
        source: "known",
      },
      {
        label: "客单价",
        value: `¥${metrics.averageOrderValue}`,
        change: metrics.averageOrderValueChange,
        source: "known",
      },
    ];

    inferences.push({
      text: decomposition.conclusion,
      evidence: [
        ...buildInferenceEvidence(metrics),
        {
          label: "推断说明",
          value: `订单量 ${formatChange(metrics.ordersChange)}，客单价 ${formatChange(metrics.averageOrderValueChange)}，因此当前主要观察方向为${primaryCause === "orders" ? "订单量" : primaryCause === "aov" ? "客单价" : "订单量与客单价"}`,
          source: "inferred",
        },
      ],
    });

    steps.push({
      level: 2,
      title: "营业额拆解：订单量 × 客单价",
      conclusion: decomposition.conclusion,
      evidence: layer2Evidence,
    });

    if (primaryCause === "orders" || primaryCause === "both") {
      const customerAnalysis = analyzeCustomerDecomposition(customers);
      customerCause = customerAnalysis.customerCause;

      const layer3Evidence: EvidenceItem[] = [
        {
          label: "新客",
          value: `${customers.newCustomers} 人`,
          change: customers.newCustomersChange,
          source: "known",
        },
        {
          label: "老客",
          value: `${customers.returningCustomers} 人`,
          change: customers.returningCustomersChange,
          source: "known",
        },
        {
          label: "新客历史同期均值",
          value: `${baseline.newCustomersAverage} 人`,
          source: "known",
        },
        {
          label: "老客历史同期均值",
          value: `${baseline.returningCustomersAverage} 人`,
          source: "known",
        },
      ];

      inferences.push({
        text: customerAnalysis.conclusion,
        evidence: [
          {
            label: "新客变化",
            value: formatChange(customers.newCustomersChange),
            source: "inferred",
          },
          {
            label: "老客变化",
            value: formatChange(customers.returningCustomersChange),
            source: "inferred",
          },
          {
            label: "推断说明",
            value: `新客 ${formatChange(customers.newCustomersChange)}，老客 ${formatChange(customers.returningCustomersChange)}，因此当前订单量变化的主要观察方向为${customerCause === "new" ? "新客" : customerCause === "returning" ? "老客" : customerCause === "both" ? "新客与老客" : "其他因素"}`,
            source: "inferred",
          },
        ],
      });

      steps.push({
        level: 3,
        title: "订单量拆解：新客 vs 老客",
        conclusion: customerAnalysis.conclusion,
        evidence: layer3Evidence,
      });
    }
  } else {
    const risingConclusion = `当前营业额较历史同期上升，订单量变化 ${formatChange(metrics.ordersChange)}，客单价变化 ${formatChange(metrics.averageOrderValueChange)}。`;
    inferences.push({
      text: risingConclusion,
      evidence: buildInferenceEvidence(metrics),
    });
    steps.push({
      level: 2,
      title: "营业额拆解：订单量 × 客单价",
      conclusion: risingConclusion,
      evidence: [
        {
          label: "订单量",
          value: `${metrics.orders} 单`,
          change: metrics.ordersChange,
          source: "known",
        },
        {
          label: "客单价",
          value: `¥${metrics.averageOrderValue}`,
          change: metrics.averageOrderValueChange,
          source: "known",
        },
      ],
    });
  }

  const summary = buildSummary("anomaly", inferences);

  return {
    status: "anomaly",
    currentProblem,
    primaryCause,
    customerCause,
    summary,
    facts,
    inferences,
    steps,
    insights: [
      {
        type: "anomaly",
        title: "营业额异常",
        description: currentProblem,
        evidence: [
          `今日营业额 ¥${revenue.revenue.toLocaleString()}，历史同期均值 ¥${revenue.historicalAverage.toLocaleString()}`,
          `较历史同期变化 ${formatChange(revenue.revenueChange)}`,
        ],
        severity: "critical",
      },
      {
        type: "judgment",
        title: "AI 初步判断",
        description: summary,
        evidence: inferences.flatMap((item) =>
          item.evidence.map(
            (evidence) => `${evidence.label}：${evidence.value}`
          )
        ),
        severity: "warning",
      },
    ],
    unknownFactors,
  };
}
