import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/db/supabase";
import { withTimeout } from "@/lib/utils/withTimeout";
import type { DiagnosisSnapshotPayload } from "@/types";

const SUPABASE_TIMEOUT_MS = 5000;

export async function getDiagnosisSnapshot(
  storeId: string,
  diagnosisDate: string
): Promise<DiagnosisSnapshotPayload | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await withTimeout(
      (async () =>
        supabase
          .from("diagnosis_snapshots")
          .select("diagnosis_result")
          .eq("store_id", storeId)
          .eq("diagnosis_date", diagnosisDate)
          .maybeSingle())(),
      SUPABASE_TIMEOUT_MS,
      "Supabase diagnosis snapshot query timed out"
    );

    if (error || !data) {
      return null;
    }

    return data.diagnosis_result as DiagnosisSnapshotPayload;
  } catch {
    return null;
  }
}

export async function saveDiagnosisSnapshot(
  storeId: string,
  diagnosisDate: string,
  payload: DiagnosisSnapshotPayload
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  const { error } = await withTimeout(
    (async () =>
      supabase.from("diagnosis_snapshots").upsert(
        {
          store_id: storeId,
          diagnosis_date: diagnosisDate,
          diagnosis_result: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,diagnosis_date" }
      ))(),
    SUPABASE_TIMEOUT_MS,
    "Supabase diagnosis snapshot save timed out"
  );

  if (error) {
    throw new Error(`保存诊断快照失败：${error.message}`);
  }
}
