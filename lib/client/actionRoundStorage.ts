import type { ActionPlanViewModel, ActionReviewResult, ActionRoundRecord } from "@/types";
import { addDays, parseDurationDays } from "@/lib/action/parseDurationDays";

const STORAGE_PREFIX = "action-rounds-v1";

function getStorageKey(storeId: string): string {
  return `${STORAGE_PREFIX}-${storeId}`;
}

export function readActionRounds(storeId: string): ActionRoundRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(getStorageKey(storeId));
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as ActionRoundRecord[];
  } catch {
    return [];
  }
}

export function writeActionRounds(
  storeId: string,
  rounds: ActionRoundRecord[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getStorageKey(storeId), JSON.stringify(rounds));
  } catch {
    // ignore quota errors
  }
}

export function createActionRound(
  storeId: string,
  plan: ActionPlanViewModel
): ActionRoundRecord {
  const startedAt = new Date().toISOString();
  const durationDays = parseDurationDays(plan.duration);
  const endAt = addDays(startedAt, durationDays);

  return {
    id: crypto.randomUUID(),
    storeId,
    startedAt,
    endAt,
    durationLabel: plan.duration,
    plan,
    reviewStatus: "in_progress",
    review: null,
  };
}

export function appendActionRound(
  storeId: string,
  plan: ActionPlanViewModel
): ActionRoundRecord {
  const round = createActionRound(storeId, plan);
  const rounds = readActionRounds(storeId);
  writeActionRounds(storeId, [round, ...rounds]);
  return round;
}

export function updateActionRound(
  storeId: string,
  roundId: string,
  patch: Pick<ActionRoundRecord, "reviewStatus" | "review">
): void {
  const rounds = readActionRounds(storeId).map((round) =>
    round.id === roundId ? { ...round, ...patch } : round
  );
  writeActionRounds(storeId, rounds);
}

export function deleteActionRound(storeId: string, roundId: string): void {
  const rounds = readActionRounds(storeId).filter((round) => round.id !== roundId);
  writeActionRounds(storeId, rounds);
}

export function isRoundPeriodEnded(round: ActionRoundRecord): boolean {
  return Date.now() >= new Date(round.endAt).getTime();
}

export type { ActionReviewResult };
