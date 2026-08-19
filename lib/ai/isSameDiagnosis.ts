import type { DiagnosisResult } from "@/types";

export function isSameDiagnosis(
  a: DiagnosisResult,
  b: DiagnosisResult
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
