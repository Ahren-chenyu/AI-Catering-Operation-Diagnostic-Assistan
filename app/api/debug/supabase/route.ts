import { todayMetrics as mockTodayMetrics } from "@/lib/data/mockData";
import {
  getDailyMetrics,
  getHistoricalBaseline,
  getStore,
} from "@/lib/services/dataProvider";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const storeId = "store-001";
  const date = mockTodayMetrics.date;

  const configured = isSupabaseConfigured();
  let directQuery: { ok: boolean; error?: string; rowCount?: number } = {
    ok: false,
  };

  if (configured) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .maybeSingle();

      if (error) {
        directQuery = { ok: false, error: error.message };
      } else {
        directQuery = { ok: true, rowCount: data ? 1 : 0 };
      }
    }
  }

  const [store, dailyMetrics, historicalBaseline] = await Promise.all([
    getStore(storeId),
    getDailyMetrics(storeId, date),
    getHistoricalBaseline(storeId),
  ]);

  const connected = configured && directQuery.ok;
  const hasData = Boolean(store && dailyMetrics && historicalBaseline);

  return NextResponse.json({
    status: connected ? "connected" : "fallback",
    configured,
    directQuery,
    data: {
      store,
      dailyMetrics,
      historicalBaseline,
    },
    hint: !configured
      ? "未配置 Supabase 环境变量，当前使用 mock 数据。"
      : !directQuery.ok
        ? `Supabase 查询失败：${directQuery.error ?? "未知错误"}，已 fallback 到 mock。`
        : !hasData
          ? "Supabase 已连接，但未找到完整 seed 数据，部分结果可能来自 mock。"
          : "Supabase 连接正常，数据读取成功。",
  });
}
