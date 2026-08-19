import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/db/supabase";
import type { DiagnosisSnapshotPayload } from "@/types";

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
    const { data, error } = await supabase
      .from("diagnosis_snapshots")
      .select("diagnosis_result")
      .eq("store_id", storeId)
      .eq("diagnosis_date", diagnosisDate)
      .maybeSingle();

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

  const { error } = await supabase.from("diagnosis_snapshots").upsert(
    {
      store_id: storeId,
      diagnosis_date: diagnosisDate,
      diagnosis_result: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "store_id,diagnosis_date" }
  );

  if (error) {
    throw new Error(`保存诊断快照失败：${error.message}`);
  }
}
