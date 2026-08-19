import { NextResponse } from "next/server";

/** 生产环境禁用 debug API，开发环境返回 null 表示允许继续处理 */
export function blockDebugRouteInProduction(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return null;
}
