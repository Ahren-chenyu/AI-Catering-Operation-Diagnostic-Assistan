# AI 餐饮经营诊断助手

> 让餐饮经营者不用自己分析复杂报表，也能知道门店发生了什么、为什么发生，以及下一步应该做什么。

传统餐饮 SaaS 擅长记录和展示数据；本项目在数据之上增加一层 **经营决策 Agent**：主动发现异常 → 规则拆解原因 → AI 解释与建议 → 可执行行动 → 到期自动复盘。

---

## 为什么做这个产品

餐饮门店每天都会产生营业额、客流、客单价、新老客等数据。对中小经营者来说，真正困难的往往不是「有没有数据」，而是：

> **知道数字变了，却不知道为什么变，更不知道该先解决什么。**

本项目把经营分析从「看报表」升级为完整决策闭环：

```text
经营数据 → 指标计算 → 异常识别 → 原因推断 → 问题诊断 → 行动计划 → 效果复盘
```

目标很明确：老板打开系统，不用提问，也能走完「发生了什么 → 为什么 → 怎么办 → 做得怎么样」。

---

## 产品亮点

| 能力 | 说明 |
|------|------|
| **主动发现** | 对比历史基线，营业额偏离超过阈值时自动提醒，无需老板先提问 |
| **证据优先** | 规则引擎分层拆解（营业额 → 订单/客单 → 新客/老客），每条结论附带数据证据 |
| **诚实边界** | 明确区分「已知事实 / 数据推断 / 当前无法判断」，不编造营销、天气等缺失数据 |
| **可执行建议** | DeepSeek 基于诊断结果生成具体行动方案（步骤、周期、预算、观察指标） |
| **闭环复盘** | 启动行动后记录轮次，到期后用区间经营数据做 AI 自动复盘 |
| **可降级运行** | 未配置 Supabase / DeepSeek 时回退到本地演示数据与规则引擎，本地也能完整演示 |

---

## 核心用户路径

```text
AI 自动汇报（驾驶舱）
        ↓
   发现营业额异常
        ↓
AI 经营分析（分层诊断 + 证据 + DeepSeek 解读）
        ↓
AI 行动指南（可执行方案，可一键启动）
        ↓
AI 复盘记录（到期后自动评估效果）
```

对应页面：

| 路径 | 导航名称 | 作用 |
|------|----------|------|
| `/dashboard` | AI自动汇报 | 今日指标概览、AI 异常提醒、进入诊断 |
| `/diagnosis` | AI经营分析 | 规则诊断结论、分层逻辑、数据证据、DeepSeek 经营解读 |
| `/action-plan` | AI行动指南 | DeepSeek / 规则引擎行动方案，启动行动轮次 |
| `/review-records` | AI复盘记录 | 查看各轮行动执行与 AI 复盘结果 |

访问 `/` 会自动跳转到 `/dashboard`。

---

## 技术架构

```text
┌─────────────────────────────────────────────────────────┐
│  Next.js 15 App Router（React 19 + TypeScript）          │
│  页面：dashboard / diagnosis / action-plan / review      │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  API Routes                                              │
│  /api/dashboard  /api/diagnosis  /api/action-plan        │
│  /api/action-review                                      │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌──────────────────┐
│ dataProvider  │  │ diagnosisEngine│  │ DeepSeek 层      │
│ Supabase 优先 │  │ 规则诊断       │  │ 解读 / 行动 /    │
│ Mock 回退     │  │ 异常与拆解     │  │ 复盘生成         │
└───────────────┘  └────────────────┘  └──────────────────┘
```

### 双层 AI 设计

1. **规则引擎（`lib/ai/diagnosisEngine.ts`）**  
   确定性计算：异常判定、营业额拆解、客群拆解、证据与未知因素。结果可解释、可复现。

2. **大模型层（DeepSeek）**  
   在规则结果之上生成自然语言经营解读、可执行行动方案、行动复盘；严格约束「只能使用 DiagnosisResult 中的事实」。

3. **诊断快照**  
   同一门店、同一日期的诊断与 AI 解读可写入 Supabase，避免重复调用；指标未变时直接复用快照。

### 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 15（App Router，`standalone` 输出） |
| 语言 / UI | TypeScript、React 19、Tailwind CSS |
| 数据 | Supabase（stores / daily_metrics / historical_baselines / 诊断快照），未配置时用 `lib/data/mockData.ts` |
| AI | DeepSeek（OpenAI 兼容 SDK），未配置时行动方案回退规则引擎 |
| 部署 | 腾讯云 CloudBase CloudRun；亦可 Vercel |
| 本地行动记录 | 浏览器 `localStorage`（行动轮次与复盘状态） |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装与启动

```bash
npm install
cp .env.example .env.local   # 按需填写，亦可先空跑 Mock 演示
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

未配置 Supabase / DeepSeek 时，系统使用演示门店「XX烧烤店」的 Mock 数据与规则引擎，核心路径仍可走通。

### 环境变量

参考 `.env.example`：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端使用，勿暴露到前端 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key（仅服务端） |
| `DEEPSEEK_MODEL` | 如 `deepseek-v4-flash` |
| `NEXT_PUBLIC_APP_URL` | 可选；Server Component 内部 fetch 时使用，默认 `http://localhost:3000` |

---

## 演示数据一览

默认演示门店：**XX烧烤店**（烧烤）

| 指标 | 当日 | 相对历史基线 |
|------|------|----------------|
| 营业额 | ¥28,000 | 约 -16.7%（触发异常） |
| 订单量 | 1,200 单 | 明显下降 |
| 客单价 | ¥80 | 上升 |
| 新客 | 230 人 | 明显下降 |
| 老客 | 500 人 | 下降 |

规则引擎典型结论：营业额下降主要来自**订单量**，进一步观察方向为**新客**下降；客单价上升说明问题不在提价，而在获客/到店。

异常阈值（Demo）：相对历史基线偏离 **> 10%** 触发提醒（见 `lib/ai/diagnosisConfig.ts`）。

---

## 项目结构（精简）

```text
app/
  dashboard/          # AI 自动汇报
  diagnosis/          # AI 经营分析
  action-plan/        # AI 行动指南
  review-records/     # AI 复盘记录
  api/                # dashboard / diagnosis / action-plan / action-review
components/           # 布局、诊断、行动计划、复盘、通用 UI
lib/
  ai/                 # 诊断引擎、DeepSeek、指标工具、行动/复盘生成
  services/           # 业务上下文、数据提供、诊断快照
  db/                 # Supabase 客户端与快照仓库
  metrics/            # 变化率与指纹
  data/mockData.ts    # 演示数据
types/index.ts        # 领域类型定义
scripts/              # CloudBase 部署脚本
```

---

## 部署

### 腾讯云 CloudBase（CloudRun）

1. 复制 `cloudbaserc.example.json` 为 `cloudbaserc.json`，填入你的 `envId`
2. 配置 `.env.local` 中的 Supabase 与 DeepSeek 变量
3. 登录并部署：

```bash
npm run login:cloudbase
npm run deploy:cloudbase:env   # 从 .env.local 注入环境变量并部署
# 或
npm run deploy:cloudbase
```

项目使用 `output: "standalone"`，适合容器化运行（端口 3000）。

### Vercel

仓库含 `vercel.json`（区域示例：`hkg1`）。在 Vercel 项目中配置相同环境变量后即可部署。

---

## 当前版本与路线图

### 已实现（MVP）

- [x] 四页核心闭环：汇报 → 分析 → 行动 → 复盘
- [x] 规则引擎经营诊断（异常、拆解、证据、未知因素）
- [x] DeepSeek 经营解读与行动方案（含规则回退）
- [x] Supabase 数据接入与 Mock 降级
- [x] 日度诊断快照缓存
- [x] 行动轮次启动与 AI 自动复盘
- [x] 响应式侧边栏与移动端适配
- [x] CloudBase / Vercel 部署配置

### 暂未纳入

登录注册、多门店权限、真实 POS / 微信连接、复杂 CRM、行业 Benchmark、完整营销投放后台等。

### 后续方向

- 历史趋势与指标可视化
- 渠道 / 餐段 / 菜品等更细拆解接入诊断（部分演示拆解已在数据层预留）
- 多门店与门店画像
- 从「用户打开再诊断」升级为定时监控与主动推送

---

## 产品设计原则

1. **主动而不是被动** — 老板不需要先问对问题  
2. **证据优先** — 没有数据依据不下结论  
3. **结论可解释** — 分层诊断与证据对用户可见  
4. **建议可执行** — 禁止空泛口号，要求步骤与观察指标  
5. **先把一个问题做透** — MVP 聚焦「营业额异常后怎么办」

更完整的产品定义见 [`product-spec.md`](./product-spec.md)。

---

## 作者思考

这个项目的核心不是「做一个餐饮聊天机器人」，而是验证：

> 如果老板每天面对大量经营数据却缺少分析能力，AI 能否成为他的经营分析助手？

因此优先级始终是：

**业务问题 → 数据与规则 → AI 能力 → 用户体验 → 商业价值**

而不是单纯堆砌模型能力。
