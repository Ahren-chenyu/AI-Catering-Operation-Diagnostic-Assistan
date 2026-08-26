import Header from "@/components/layout/Header";
import ButtonLink from "@/components/ui/ButtonLink";
import { GROWTH_AS_OF } from "@/lib/growth/dataset";

const WORK_ITEMS = [
  "餐饮业务场景分析",
  "用户痛点定义",
  "产品需求分析",
  "用户增长指标设计",
  "RFM 用户模型设计",
  "AI 应用场景设计",
  "产品流程设计（经营诊断 + 用户增长闭环）",
  "规则引擎 / Prompt 约束设计",
  "MVP 开发（Next.js App Router）",
  "确定性 Mock 数据集与指标计算",
  "营销任务模拟与效果复盘",
];

const JD_MAPPING = [
  {
    title: "餐饮行业理解",
    body: "门店经营流程、公域获客与私域沉淀、SaaS 经营看板到增长运营的场景衔接。",
  },
  {
    title: "用户分析",
    body: "增长 KPI、RFM 分层、生命周期/价值标签、字段约束的 AI 用户画像。",
  },
  {
    title: "AI 策略",
    body: "规则驱动的增长机会识别 + 可解释营销策略（权益/渠道/文案/预测）。",
  },
  {
    title: "数据分析",
    body: "经营指标、用户指标、活动 ROI = (收入 - 成本) / 成本，全站同源数据。",
  },
  {
    title: "产品闭环",
    body: "发现 → 分析 → 策略 → 执行模拟 → 复盘 → 下一轮建议。",
  },
  {
    title: "AI 产品能力",
    body: "规则引擎优先 + 可选 LLM 增强 + Fallback；产品层 4 Agent 职责划分。",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header date={GROWTH_AS_OF} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-xl font-bold text-stone-900">项目说明</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            「AI餐饮经营助手」面向中小餐饮商家：在经营数据之上叠加决策与增长层，
            帮助老板走完「发生了什么 → 为什么 → 运营谁 → 怎么做 → 效果如何」。
          </p>
        </div>

        <section className="mb-8 max-w-3xl rounded-xl border border-stone-200 bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-stone-900">项目背景</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            传统餐饮 SaaS 擅长记录与展示经营数据，但中小商家往往缺少把数据转化成用户运营动作的能力。
          </p>
          <h3 className="mt-5 text-sm font-semibold text-stone-900">用户痛点</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
            <li>知道营业额变了，不知道为什么</li>
            <li>不知道该优先运营哪些用户</li>
            <li>不知道该用什么权益、渠道和触达时机</li>
            <li>做完活动后缺少可解释的效果复盘</li>
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-stone-900">产品目标</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            通过经营分析 + 用户分析 + AI 策略，形成发现问题 → 定位用户 → 制定策略 →
            执行营销 → 效果复盘的完整闭环。
          </p>
        </section>

        <section className="mb-8 max-w-3xl rounded-xl border border-stone-200 bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-stone-900">我的工作</h3>
          <p className="mt-1 text-xs text-stone-500">仅列出本作品集已落地内容</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {WORK_ITEMS.map((item) => (
              <li
                key={item}
                className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-stone-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            产品能力验证
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JD_MAPPING.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-stone-200 bg-white p-4 shadow-card"
              >
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">从自动汇报开始</ButtonLink>
          <ButtonLink href="/growth" variant="secondary">
            进入用户增长中心
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
