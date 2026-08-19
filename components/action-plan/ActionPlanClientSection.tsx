"use client";

import { useEffect, useState } from "react";
import ActionPlanDetail from "@/components/action-plan/ActionPlanDetail";
import ActionPlanLoading from "@/components/action-plan/ActionPlanLoading";
import { buildActionPlanView } from "@/lib/ai/buildActionPlanView";
import type { DiagnosisApiResponse } from "@/lib/api/apiTypes";
import {
  getActionPlanCacheKey,
  readSessionCache,
  writeSessionCache,
} from "@/lib/client/aiSessionCache";
import type {
  ActionPlanViewModel,
  DiagnosisContext,
  DiagnosisResult,
} from "@/types";

interface ActionPlanClientSectionProps {
  storeId: string;
  date: string;
  metricsFingerprint: string;
  diagnosis: DiagnosisResult;
  context: DiagnosisContext;
  onViewReady?: (view: ActionPlanViewModel) => void;
}

export default function ActionPlanClientSection({
  storeId,
  date,
  metricsFingerprint,
  diagnosis,
  context,
  onViewReady,
}: ActionPlanClientSectionProps) {
  const [view, setView] = useState<ActionPlanViewModel | undefined>(undefined);

  useEffect(() => {
    const cacheKey = getActionPlanCacheKey(storeId, date, metricsFingerprint);
    const cached = readSessionCache<ActionPlanViewModel>(cacheKey);

    if (cached) {
      setView(cached);
      return;
    }

    let cancelled = false;

    async function fetchActionPlan() {
      try {
        const params = new URLSearchParams({ storeId, date });
        const response = await fetch(`/api/diagnosis?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setView(buildActionPlanView(diagnosis, context, null));
          }
          return;
        }

        const data = (await response.json()) as DiagnosisApiResponse;
        const apiContext: DiagnosisContext = {
          metrics: data.metrics,
          baseline: context.baseline,
        };

        if (!cancelled) {
          if (data.aiInsight) {
            const planView = buildActionPlanView(
              data.diagnosis,
              apiContext,
              data.aiInsight
            );
            writeSessionCache(cacheKey, planView);
            setView(planView);
          } else {
            setView(buildActionPlanView(data.diagnosis, apiContext, null));
          }
        }
      } catch {
        if (!cancelled) {
          setView(buildActionPlanView(diagnosis, context, null));
        }
      }
    }

    void fetchActionPlan();

    return () => {
      cancelled = true;
    };
  }, [storeId, date, metricsFingerprint, diagnosis, context]);

  useEffect(() => {
    if (view && onViewReady) {
      onViewReady(view);
    }
  }, [view, onViewReady]);

  if (view === undefined) {
    return <ActionPlanLoading />;
  }

  return <ActionPlanDetail view={view} />;
}
