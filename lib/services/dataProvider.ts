import "server-only";

import {
  historicalBaseline as mockHistoricalBaseline,
  store as mockStore,
  todayMetrics as mockTodayMetrics,
} from "@/lib/data/mockData";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/db/supabase";
import { withTimeout } from "@/lib/utils/withTimeout";
import type { HistoricalBaseline, RawDailyMetrics, Store } from "@/types";

const SUPABASE_TIMEOUT_MS = 5000;

interface StoreRow {
  id: string;
  name: string;
  type: string | null;
}

interface DailyMetricsRow {
  date: string;
  revenue: number;
  orders: number;
  average_order_value: number | null;
  new_customers: number;
  returning_customers: number;
}

interface HistoricalBaselineRow {
  revenue_average: number;
  orders_average: number | null;
  aov_average: number | null;
  new_customers_average: number | null;
  returning_customers_average: number | null;
}

function mapStoreRow(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    type: row.type ?? "",
  };
}

function mapDailyMetricsRow(row: DailyMetricsRow): RawDailyMetrics {
  return {
    date: row.date,
    revenue: Number(row.revenue),
    orders: row.orders,
    averageOrderValue: Number(row.average_order_value ?? 0),
    newCustomers: row.new_customers,
    returningCustomers: row.returning_customers,
  };
}

function mapHistoricalBaselineRow(row: HistoricalBaselineRow): HistoricalBaseline {
  return {
    revenueAverage: Number(row.revenue_average),
    ordersAverage: Number(row.orders_average ?? 0),
    averageOrderValueAverage: Number(row.aov_average ?? 0),
    newCustomersAverage: Number(row.new_customers_average ?? 0),
    returningCustomersAverage: Number(row.returning_customers_average ?? 0),
  };
}

function getMockStore(storeId: string): Store | null {
  if (storeId !== mockStore.id) {
    return null;
  }
  return mockStore;
}

function getMockDailyMetrics(storeId: string, date: string): RawDailyMetrics | null {
  if (storeId !== mockStore.id || date !== mockTodayMetrics.date) {
    return null;
  }
  return mockTodayMetrics;
}

function getMockHistoricalBaseline(storeId: string): HistoricalBaseline | null {
  if (storeId !== mockStore.id) {
    return null;
  }
  return mockHistoricalBaseline;
}

export async function getStore(storeId: string): Promise<Store | null> {
  if (!isSupabaseConfigured()) {
    return getMockStore(storeId);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return getMockStore(storeId);
  }

  try {
    const { data, error } = await withTimeout(
      (async () =>
        supabase
          .from("stores")
          .select("id, name, type")
          .eq("id", storeId)
          .maybeSingle())(),
      SUPABASE_TIMEOUT_MS,
      "Supabase store query timed out"
    );

    if (error || !data) {
      return getMockStore(storeId);
    }

    return mapStoreRow(data as StoreRow);
  } catch {
    return getMockStore(storeId);
  }
}

export async function getDailyMetrics(
  storeId: string,
  date: string
): Promise<RawDailyMetrics | null> {
  if (!isSupabaseConfigured()) {
    return getMockDailyMetrics(storeId, date);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return getMockDailyMetrics(storeId, date);
  }

  try {
    const { data, error } = await withTimeout(
      (async () =>
        supabase
          .from("daily_metrics")
          .select(
            "date, revenue, orders, average_order_value, new_customers, returning_customers"
          )
          .eq("store_id", storeId)
          .eq("date", date)
          .maybeSingle())(),
      SUPABASE_TIMEOUT_MS,
      "Supabase daily metrics query timed out"
    );

    if (error || !data) {
      return getMockDailyMetrics(storeId, date);
    }

    return mapDailyMetricsRow(data as DailyMetricsRow);
  } catch {
    return getMockDailyMetrics(storeId, date);
  }
}

export async function getDailyMetricsInRange(
  storeId: string,
  startDate: string,
  endDate: string
): Promise<RawDailyMetrics[]> {
  if (!isSupabaseConfigured()) {
    const mock = getMockDailyMetrics(storeId, mockTodayMetrics.date);
    if (!mock) {
      return [];
    }
    if (mock.date >= startDate && mock.date <= endDate) {
      return [mock];
    }
    return [];
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await withTimeout(
      (async () =>
        supabase
          .from("daily_metrics")
          .select(
            "date, revenue, orders, average_order_value, new_customers, returning_customers"
          )
          .eq("store_id", storeId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: true }))(),
      SUPABASE_TIMEOUT_MS,
      "Supabase daily metrics range query timed out"
    );

    if (error || !data) {
      return [];
    }

    return (data as DailyMetricsRow[]).map(mapDailyMetricsRow);
  } catch {
    return [];
  }
}

export async function getHistoricalBaseline(
  storeId: string
): Promise<HistoricalBaseline | null> {
  if (!isSupabaseConfigured()) {
    return getMockHistoricalBaseline(storeId);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return getMockHistoricalBaseline(storeId);
  }

  try {
    const { data, error } = await withTimeout(
      (async () =>
        supabase
          .from("historical_baselines")
          .select(
            "revenue_average, orders_average, aov_average, new_customers_average, returning_customers_average"
          )
          .eq("store_id", storeId)
          .maybeSingle())(),
      SUPABASE_TIMEOUT_MS,
      "Supabase baseline query timed out"
    );

    if (error || !data) {
      return getMockHistoricalBaseline(storeId);
    }

    return mapHistoricalBaselineRow(data as HistoricalBaselineRow);
  } catch {
    return getMockHistoricalBaseline(storeId);
  }
}
