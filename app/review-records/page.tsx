import Header from "@/components/layout/Header";
import ReviewRecordsSection from "@/components/review/ReviewRecordsSection";
import {
  getDefaultQueryDate,
  loadBusinessContext,
} from "@/lib/services/businessContextService";

const STORE_ID = "store-001";

export default async function ReviewRecordsPage() {
  const date = getDefaultQueryDate();
  const context = await loadBusinessContext(STORE_ID, date);
  const { store, metrics } = context;

  return (
    <>
      <Header store={store} date={metrics.date} />
      <div className="px-8 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">AI复盘记录</h2>
          <p className="mt-1 text-sm text-stone-500">
            记录每轮行动方案执行后的 AI 自动复盘结果
          </p>
        </div>

        <ReviewRecordsSection storeId={STORE_ID} />
      </div>
    </>
  );
}
