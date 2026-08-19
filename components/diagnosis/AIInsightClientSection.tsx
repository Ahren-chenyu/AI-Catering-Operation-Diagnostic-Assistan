"use client";

import AIInsightError from "@/components/diagnosis/AIInsightError";
import AIInsightLoading from "@/components/diagnosis/AIInsightLoading";
import AIInsightPanel from "@/components/diagnosis/AIInsightPanel";
import { useDiagnosisAIInsight } from "@/lib/client/useDiagnosisAIInsight";
import type { AIInsightResult } from "@/types";

interface AIInsightClientSectionProps {
  storeId: string;
  date: string;
  metricsFingerprint: string;
}

export default function AIInsightClientSection({
  storeId,
  date,
  metricsFingerprint,
}: AIInsightClientSectionProps) {
  const insight = useDiagnosisAIInsight(storeId, date, metricsFingerprint);

  if (insight === undefined) {
    return <AIInsightLoading />;
  }

  if (!insight) {
    return <AIInsightError />;
  }

  return <AIInsightPanel insight={insight} />;
}
