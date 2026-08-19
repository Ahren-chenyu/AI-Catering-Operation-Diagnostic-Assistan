"use client";

import { createContext, useContext } from "react";
import AIInsightError from "@/components/diagnosis/AIInsightError";
import AIInsightLoading from "@/components/diagnosis/AIInsightLoading";
import AIInsightPanel from "@/components/diagnosis/AIInsightPanel";
import { useDiagnosisAIInsight } from "@/lib/client/useDiagnosisAIInsight";
import type { AIInsightResult } from "@/types";

const DiagnosisAIContext = createContext<AIInsightResult | null | undefined>(
  undefined
);

interface DiagnosisAIProviderProps {
  storeId: string;
  date: string;
  metricsFingerprint: string;
  children: React.ReactNode;
}

export function DiagnosisAIProvider({
  storeId,
  date,
  metricsFingerprint,
  children,
}: DiagnosisAIProviderProps) {
  const insight = useDiagnosisAIInsight(storeId, date, metricsFingerprint);

  return (
    <DiagnosisAIContext.Provider value={insight}>
      {children}
    </DiagnosisAIContext.Provider>
  );
}

export function DiagnosisAITopLoading() {
  const insight = useContext(DiagnosisAIContext);

  if (insight !== undefined) {
    return null;
  }

  return (
    <div className="mb-8">
      <AIInsightLoading />
    </div>
  );
}

export function DiagnosisAIInsightSection() {
  const insight = useContext(DiagnosisAIContext);

  if (insight === undefined) {
    return <AIInsightLoading />;
  }

  if (!insight) {
    return <AIInsightError />;
  }

  return <AIInsightPanel insight={insight} />;
}
