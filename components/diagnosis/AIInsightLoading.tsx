export default function AIInsightLoading() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500" />
        </span>
        <p className="text-sm font-medium text-stone-600">
          AI正在分析经营情况……
        </p>
      </div>
    </div>
  );
}
