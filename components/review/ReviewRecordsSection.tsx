"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isRoundPeriodEnded,
  readActionRounds,
  updateActionRound,
} from "@/lib/client/actionRoundStorage";
import type { ActionRoundRecord } from "@/types";

interface ReviewRecordsSectionProps {
  storeId: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function generateReviewForRound(
  round: ActionRoundRecord
): Promise<Pick<ActionRoundRecord, "reviewStatus" | "review">> {
  const response = await fetch("/api/action-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storeId: round.storeId,
      roundId: round.id,
      startedAt: round.startedAt,
      endAt: round.endAt,
      plan: round.plan,
    }),
  });

  if (!response.ok) {
    return { reviewStatus: "no_data", review: null };
  }

  const data = (await response.json()) as {
    reviewStatus: "no_data" | "completed";
    review: ActionRoundRecord["review"];
  };

  return {
    reviewStatus: data.reviewStatus,
    review: data.review,
  };
}

export default function ReviewRecordsSection({
  storeId,
}: ReviewRecordsSectionProps) {
  const [rounds, setRounds] = useState<ActionRoundRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRounds = useCallback(() => {
    setRounds(readActionRounds(storeId));
  }, [storeId]);

  useEffect(() => {
    let cancelled = false;

    async function syncReviews() {
      setLoading(true);
      const currentRounds = readActionRounds(storeId);

      for (const round of currentRounds) {
        if (!isRoundPeriodEnded(round)) {
          continue;
        }

        if (round.reviewStatus !== "in_progress") {
          continue;
        }

        const result = await generateReviewForRound(round);
        updateActionRound(storeId, round.id, result);
      }

      if (!cancelled) {
        refreshRounds();
        setLoading(false);
      }
    }

    void syncReviews();

    return () => {
      cancelled = true;
    };
  }, [storeId, refreshRounds]);

  if (loading) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500" />
          </span>
          <p className="text-sm font-medium text-stone-600">正在检查复盘记录……</p>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
        <p className="text-sm text-stone-500">暂无</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <ReviewRoundCard key={round.id} round={round} />
      ))}
    </div>
  );
}

function ReviewRoundCard({ round }: { round: ActionRoundRecord }) {
  const inProgress = !isRoundPeriodEnded(round);
  const showEmpty =
    inProgress ||
    round.reviewStatus === "no_data" ||
    round.reviewStatus === "in_progress";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">行动计划</p>
          <h3 className="mt-1 text-lg font-bold text-stone-900">{round.plan.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
          {inProgress ? "执行中" : round.reviewStatus === "completed" ? "已复盘" : "暂无数据"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p className="text-stone-600">
          <span className="font-medium text-stone-800">开始时间：</span>
          {formatDateTime(round.startedAt)}
        </p>
        <p className="text-stone-600">
          <span className="font-medium text-stone-800">结束时间：</span>
          {formatDateTime(round.endAt)}
        </p>
        <p className="text-stone-600">
          <span className="font-medium text-stone-800">执行周期：</span>
          {round.durationLabel}
        </p>
        <p className="text-stone-600">
          <span className="font-medium text-stone-800">目标指标：</span>
          {round.plan.targetMetric}
        </p>
      </div>

      <div className="mt-6 border-t border-stone-100 pt-5">
        <h4 className="text-sm font-semibold text-stone-900">AI 自动复盘</h4>
        {showEmpty ? (
          <p className="mt-2 text-sm text-stone-500">暂无</p>
        ) : round.review ? (
          <div className="mt-3 space-y-4">
            <ReviewBlock title="复盘总结" content={round.review.summary} />
            <ReviewBlock title="指标分析" content={round.review.metricAnalysis} />
            <ReviewBlock title="目标评估" content={round.review.goalAssessment} />
            <ReviewBlock title="下一步建议" content={round.review.nextSteps} />
            <p className="text-xs text-stone-400">
              生成时间：{formatDateTime(round.review.generatedAt)}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">暂无</p>
        )}
      </div>
    </div>
  );
}

function ReviewBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-surface-muted px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{content}</p>
    </div>
  );
}
