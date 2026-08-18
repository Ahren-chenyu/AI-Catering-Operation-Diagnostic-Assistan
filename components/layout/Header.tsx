import { store as mockStore, todayMetrics as mockTodayMetrics } from "@/lib/data/mockData";
import type { Store } from "@/types";

interface HeaderProps {
  store?: Store;
  date?: string;
}

export default function Header({ store = mockStore, date = mockTodayMetrics.date }: HeaderProps) {
  const formattedDate = new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-8">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">{store.name}</h1>
          <p className="text-sm text-stone-500">{store.type} · {formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            MVP 演示数据
          </span>
        </div>
      </div>
    </header>
  );
}
