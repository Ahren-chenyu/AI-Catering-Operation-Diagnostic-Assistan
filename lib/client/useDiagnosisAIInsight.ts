"use client";

import { useEffect, useState } from "react";
import type { DiagnosisApiResponse } from "@/lib/api/apiTypes";
import {
  getDiagnosisCacheKey,
  readSessionCache,
  writeSessionCache,
} from "@/lib/client/aiSessionCache";
import type { AIInsightResult } from "@/types";

export function useDiagnosisAIInsight(
  storeId: string,
  date: string,
  metricsFingerprint: string
) {
  const [insight, setInsight] = useState<AIInsightResult | null | undefined>(
    undefined
  );

  useEffect(() => {
    const cacheKey = getDiagnosisCacheKey(storeId, date, metricsFingerprint);
    const cached = readSessionCache<AIInsightResult>(cacheKey);

    if (cached) {
      setInsight(cached);
      return;
    }

    let cancelled = false;

    async function fetchInsight() {
      try {
        const params = new URLSearchParams({ storeId, date });
        const response = await fetch(`/api/diagnosis?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setInsight(null);
          }
          return;
        }

        const data = (await response.json()) as DiagnosisApiResponse;

        if (!cancelled) {
          if (data.aiInsight) {
            writeSessionCache(cacheKey, data.aiInsight);
            setInsight(data.aiInsight);
          } else {
            setInsight(null);
          }
        }
      } catch {
        if (!cancelled) {
          setInsight(null);
        }
      }
    }

    void fetchInsight();

    return () => {
      cancelled = true;
    };
  }, [storeId, date, metricsFingerprint]);

  return insight;
}
