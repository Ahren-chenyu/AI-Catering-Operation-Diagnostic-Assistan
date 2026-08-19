"use client";

import { useState } from "react";
import ActionPlanClientSection from "@/components/action-plan/ActionPlanClientSection";
import StartActionButton from "@/components/action-plan/StartActionButton";
import ButtonLink from "@/components/ui/ButtonLink";
import type {
  ActionPlanViewModel,
  DiagnosisContext,
  DiagnosisResult,
} from "@/types";

interface ActionPlanPageClientProps {
  storeId: string;
  date: string;
  metricsFingerprint: string;
  diagnosis: DiagnosisResult;
  context: DiagnosisContext;
  children?: React.ReactNode;
}

export default function ActionPlanPageClient({
  children,
  storeId,
  ...sectionProps
}: ActionPlanPageClientProps) {
  const [planView, setPlanView] = useState<ActionPlanViewModel | null>(null);

  return (
    <>
      <ActionPlanClientSection
        {...sectionProps}
        storeId={storeId}
        onViewReady={setPlanView}
      />

      {children}

      <section className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/diagnosis" variant="secondary">
          返回分析页
        </ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary">
          返回主页
        </ButtonLink>
        <StartActionButton
          storeId={storeId}
          plan={planView!}
          disabled={!planView}
        />
      </section>
    </>
  );
}
