const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const STORE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export interface ApiQueryParams {
  storeId: string;
  date: string;
}

export class ApiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiValidationError";
  }
}

export function parseApiQueryParams(
  searchParams: URLSearchParams,
  defaultDate: string
): ApiQueryParams {
  const storeId = searchParams.get("storeId")?.trim() || "store-001";
  const date = searchParams.get("date")?.trim() || defaultDate;

  if (!STORE_ID_PATTERN.test(storeId)) {
    throw new ApiValidationError(
      "参数 storeId 无效，仅允许字母、数字、下划线和连字符。"
    );
  }

  if (!DATE_PATTERN.test(date)) {
    throw new ApiValidationError(
      "参数 date 无效，请使用 YYYY-MM-DD 格式。"
    );
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiValidationError("参数 date 不是有效日期。");
  }

  return { storeId, date };
}
