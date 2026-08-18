import { BusinessDataError } from "@/lib/services/businessContextService";
import { ApiValidationError } from "@/lib/api/parseQueryParams";
import { NextResponse } from "next/server";

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiValidationError) {
    return NextResponse.json(
      { error: error.message, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (error instanceof BusinessDataError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 404 }
    );
  }

  console.error("[API Error]", error);

  return NextResponse.json(
    {
      error: "服务器处理请求时发生错误，请稍后重试。",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
