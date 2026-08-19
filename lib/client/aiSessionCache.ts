export function getDiagnosisCacheKey(
  storeId: string,
  date: string,
  metricsFingerprint: string
): string {
  return `ai-diagnosis-${storeId}-${date}-${metricsFingerprint}`;
}

export function getActionPlanCacheKey(
  storeId: string,
  date: string,
  metricsFingerprint: string
): string {
  return `ai-action-plan-${storeId}-${date}-${metricsFingerprint}`;
}

export function readSessionCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeSessionCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储失败时不影响页面展示
  }
}
