import Header from "@/components/layout/Header";
import { GROWTH_AS_OF } from "@/lib/growth/dataset";

const PUBLIC_STEPS = ["美团 / 大众点评 / 抖音", "新客获取", "到店 / 下单"];
const PRIVATE_STEPS = [
  "会员注册",
  "小程序 / 公众号 / 企业微信",
  "用户沉淀",
  "用户数据分析",
  "RFM 用户分层",
  "AI 增长机会发现",
  "精准营销",
  "复购 / 召回 / 提频 / 提客单",
  "LTV 提升",
];

function FlowNode({
  label,
  accent = false,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-card ${
        accent
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-stone-200 bg-white text-stone-800"
      }`}
    >
      {label}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1 text-stone-300" aria-hidden>
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    </div>
  );
}

export default function GrowthPathPage() {
  return (
    <>
      <Header date={GROWTH_AS_OF} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">餐饮用户增长路径</h2>
          <p className="mt-1 text-sm text-stone-500">
            公域获客 → 私域沉淀 → 数据分层 → AI 策略 → LTV 提升
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
              公域获客
            </p>
            {PUBLIC_STEPS.map((step, i) => (
              <div key={step}>
                <FlowNode label={step} />
                {i < PUBLIC_STEPS.length - 1 && <Arrow />}
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-card">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
              私域运营与增长
            </p>
            {PRIVATE_STEPS.map((step, i) => (
              <div key={step}>
                <FlowNode
                  label={step}
                  accent={
                    step.includes("AI") ||
                    step.includes("RFM") ||
                    step.includes("LTV")
                  }
                />
                {i < PRIVATE_STEPS.length - 1 && <Arrow />}
              </div>
            ))}
          </section>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-stone-600">
          本产品聚焦「到店/下单之后」的私域环节：用经营与用户数据识别机会，生成可解释营销策略，并通过模拟执行与复盘验证增长闭环。
        </p>
      </div>
    </>
  );
}
