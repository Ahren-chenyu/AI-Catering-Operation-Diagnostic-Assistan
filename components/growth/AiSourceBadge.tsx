export function AiSourceBadge({
  source,
}: {
  source: "deepseek" | "rules" | null | undefined;
}) {
  if (!source) return null;
  const isLlm = source === "deepseek";
  return (
    <span
      className={
        isLlm
          ? "inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200"
          : "inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 ring-1 ring-stone-200"
      }
    >
      {isLlm ? "DeepSeek 生成" : "规则引擎（Fallback）"}
    </span>
  );
}
