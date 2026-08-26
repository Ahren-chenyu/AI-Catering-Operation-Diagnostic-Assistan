import Header from "@/components/layout/Header";
import { GROWTH_AS_OF } from "@/lib/growth/dataset";

const PIPELINE = [
  "经营数据 + 用户数据 + 活动数据",
  "数据分析层（指标 / 趋势）",
  "规则引擎（异常 & 机会）",
  "用户标签 / RFM 分层",
  "增长机会识别",
  "LLM（可选增强文案）",
  "AI 增长策略",
  "营销任务模拟",
  "效果数据",
  "AI 复盘",
];

const AGENTS = [
  {
    name: "经营诊断 Agent",
    question: "生意发生了什么？",
    scope: "营业额异常、分层拆解、证据与行动建议（既有模块）",
  },
  {
    name: "用户洞察 Agent",
    question: "哪些用户发生了变化？",
    scope: "增长 KPI、RFM 分层、用户标签与 AI 画像",
  },
  {
    name: "增长策略 Agent",
    question: "应该对哪些用户采取什么策略？",
    scope: "机会规则 → 结构化营销策略 → 权益/渠道/文案",
  },
  {
    name: "效果复盘 Agent",
    question: "策略执行后效果如何？下一步怎么优化？",
    scope: "触达/核销/GMV/ROI + 复购提升 + 下一轮建议",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <Header date={GROWTH_AS_OF} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">AI 策略系统架构</h2>
          <p className="mt-1 text-sm text-stone-500">
            产品层体现 4 个 Agent 职责；底层以规则引擎为主，可选 DeepSeek，失败自动回退
          </p>
        </div>

        <section className="mb-10 overflow-x-auto rounded-xl border border-stone-200 bg-white p-6 shadow-card">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
            数据 → 策略流水线
          </p>
          <div className="flex min-w-[720px] flex-wrap items-center gap-2">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="rounded-lg border border-stone-200 bg-surface-muted px-3 py-2 text-xs font-medium text-stone-800">
                  {step}
                </div>
                {i < PIPELINE.length - 1 && (
                  <span className="text-stone-300" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            四个 Agent（产品概念）
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {AGENTS.map((a) => (
              <div
                key={a.name}
                className="rounded-xl border border-stone-200 bg-white p-5 shadow-card"
              >
                <p className="text-sm font-semibold text-brand-700">{a.name}</p>
                <p className="mt-2 text-base font-medium text-stone-900">
                  {a.question}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {a.scope}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-stone-200 bg-surface-muted p-5">
          <h3 className="text-sm font-semibold text-stone-900">实现说明</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
            <li>增长机会、营销策略、用户画像、活动复盘：确定性规则 / 模板引擎</li>
            <li>经营诊断解读、行动方案、行动复盘：可调用 DeepSeek，失败回退规则</li>
            <li>不因 LLM 不可用导致 Demo 中断</li>
          </ul>
        </section>
      </div>
    </>
  );
}
