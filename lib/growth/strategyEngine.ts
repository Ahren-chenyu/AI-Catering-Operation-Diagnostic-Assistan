import type {
  GrowthOpportunity,
  GrowthUser,
  MarketingStrategy,
  OpportunityId,
} from "@/types/growth";
import { calcRoi } from "./calc";
import { getGrowthDataset } from "./dataset";
import { daysBetween } from "./seed";

function avgAov(users: GrowthUser[]): number {
  if (users.length === 0) return 0;
  const sum = users.reduce((s, u) => s + u.avgOrderValue, 0);
  return Math.round((sum / users.length) * 10) / 10;
}

function topPreferredTime(users: GrowthUser[]): string {
  const counts: Record<string, number> = {};
  for (const u of users) {
    counts[u.preferredTime] = (counts[u.preferredTime] ?? 0) + 1;
  }
  return (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "晚餐"
  );
}

function targetUsersForOpportunity(
  id: OpportunityId,
  users: GrowthUser[],
  asOf: string
): GrowthUser[] {
  switch (id) {
    case "new_repeat_low":
    case "growth_quality":
      return users.filter((u) => {
        const d = daysBetween(u.firstOrderDate, asOf);
        return d >= 7 && d <= 14 && u.orderCount === 1;
      });
    case "high_value_decline":
      return users.filter(
        (u) =>
          (u.segmentId === "churn_risk" || u.segmentId === "high_value") &&
          u.ordersPrev60 >= 2 &&
          u.ordersLast30 / Math.max(u.ordersPrev60 / 2, 1) < 0.7
      );
    case "lunch_growth":
      return users.filter(
        (u) => u.preferredTime === "午餐" && u.recencyDays >= 14
      );
    case "arpu_lift":
      return users.filter((u) => u.segmentId === "potential");
    default:
      return [];
  }
}

/**
 * 规则引擎生成结构化营销策略（数据驱动，可复现）。
 * DeepSeek 可用时由 API 层增强文案，失败则完整回退到本函数。
 */
export function generateMarketingStrategy(
  opportunity: GrowthOpportunity
): MarketingStrategy {
  const { asOfDate, users } = getGrowthDataset();
  const target = targetUsersForOpportunity(
    opportunity.id,
    users,
    asOfDate
  );
  const count = opportunity.targetUserCount || target.length;
  const aov = avgAov(target);
  const timeSlot = topPreferredTime(target);
  const sensitiveHigh = target.filter((u) => u.couponSensitivity === "高").length;
  const sensitiveShare =
    target.length > 0
      ? Math.round((sensitiveHigh / target.length) * 1000) / 10
      : 0;

  const base = strategyTemplates(opportunity, count, aov, timeSlot, sensitiveShare);

  const claimRate = base.forecast.claimRate;
  const redemptionRate = base.forecast.redemptionRate;
  const reach = Math.round(count * 0.96);
  const claimers = Math.round(reach * (claimRate / 100));
  const redeemers = Math.round(claimers * (redemptionRate / 100));
  const gmv = Math.round(redeemers * (aov || 90));
  const cost = Math.round(claimers * base.unitCost + redeemers * 5);
  const roi = calcRoi(gmv, cost);

  return {
    ...base,
    opportunityId: opportunity.id,
    targetUserCount: count,
    forecast: {
      reach,
      claimRate,
      redemptionRate,
      repeatUsers: redeemers,
      gmv,
      cost,
      roi,
    },
    disclaimer: "MVP模拟预测，仅用于策略验证。",
  };
}

function strategyTemplates(
  opportunity: GrowthOpportunity,
  count: number,
  aov: number,
  timeSlot: string,
  sensitiveShare: number
): Omit<MarketingStrategy, "opportunityId" | "targetUserCount" | "forecast" | "disclaimer"> & {
  unitCost: number;
  forecast: Pick<MarketingStrategy["forecast"], "claimRate" | "redemptionRate">;
} {
  const currentRepeat = Number(opportunity.evidenceMetrics.repeatRate ?? 18.6);
  const targetRepeat = Math.round((currentRepeat + 4.4) * 10) / 10;

  switch (opportunity.id) {
    case "new_repeat_low":
    case "growth_quality":
      return {
        goal: `将新客30日复购率从 ${currentRepeat}% 提升至 ${targetRepeat}%。`,
        targetAudience: opportunity.targetUsers,
        userTraits: [
          "新客",
          "最近完成首购",
          "尚未复购",
          `平均客单价 ¥${aov || 85}`,
          `主要消费时段 ${timeSlot}`,
          `优惠敏感用户占比约 ${sensitiveShare}%`,
        ],
        benefit: sensitiveShare > 45 ? "满50减12" : "满50减10",
        benefitReason:
          "该人群客单价集中在 50–100 元区间，满减门槛接近首单客单，既能形成「再来一次」动机，又避免高额折扣损伤毛利。",
        channels: [
          {
            name: "公众号",
            reason: "新客注册后常关注公众号，适合承载图文权益说明。",
          },
          {
            name: "企业微信",
            reason: "可做一对一提醒，提高 7–14 天窗口期触达率。",
          },
          {
            name: "小程序",
            reason: "领取与核销同链路，降低跳失。",
          },
        ],
        sendTime: "周四 17:00",
        sendTimeReason:
          "周四傍晚接近周末决策窗口，且避开周五信息过载；历史到店高峰前 1–2 小时触达更易转化。",
        whyRecommended: `该人群首次消费距今 7–14 天，仍处于品牌记忆较强阶段，同时尚未形成稳定消费习惯。优惠敏感占比约 ${sensitiveShare}%，因此优先选择轻量满减促进第二次消费，而非高额折扣。目标人数 ${count} 人，规模适中，适合做小步验证。`,
        copySms: `【XX烧烤】感谢光临！专属满50减10券已到账，本周到店/外卖可用。回T退订`,
        copyWechat: `刚尝过我们的味道？专属「二次到店礼」已准备好：满50减10，本周有效。点这里一键领取，周末带朋友再来一串～`,
        copyPush: `二次光临礼：满50减10，今日可领`,
        unitCost: 8.5,
        forecast: { claimRate: 35, redemptionRate: 44 },
      };

    case "high_value_decline":
      return {
        goal: "将高价值流失风险用户近30天消费频次恢复至下降前水平的 80% 以上。",
        targetAudience: opportunity.targetUsers,
        userTraits: [
          "高价值/曾高消费",
          "近30天频次下降>30%",
          `平均客单价 ¥${aov || 120}`,
          `主要消费时段 ${timeSlot}`,
          "价格敏感度相对较低",
        ],
        benefit: "专属新品试吃 + 会员积分加倍",
        benefitReason:
          "该人群对普通满减不敏感，更在意专属感与品质体验；用新品试吃+积分比单纯降价更能维护客单。",
        channels: [
          {
            name: "企业微信",
            reason: "高价值用户适合顾问式一对一召回。",
          },
          {
            name: "小程序",
            reason: "会员中心展示专属权益，强化身份认同。",
          },
        ],
        sendTime: "周五 18:30",
        sendTimeReason: "临近周末堂食高峰，召回信息更容易转化为到店决策。",
        whyRecommended: `过去活跃的高价值用户近期频次明显下滑（共 ${count} 人）。若继续发通用优惠券，既浪费补贴又无法体现身份差异。因此采用「专属新品+积分」维护关系，优先挽回 LTV 更高的用户。`,
        copySms: `【XX烧烤】尊享召回礼：本周专属新品试吃已开启，积分加倍到账。详询企微顾问`,
        copyWechat: `好久不见。为您预留了本季新品试吃名额，到店另享积分加倍。我们想请「老朋友」先尝为敬。`,
        copyPush: `专属召回：新品试吃名额待领取`,
        unitCost: 12,
        forecast: { claimRate: 28, redemptionRate: 38 },
      };

    case "lunch_growth":
      return {
        goal: "提升工作日午餐订单量，4 周内午餐订单环比回升 10%+。",
        targetAudience: opportunity.targetUsers,
        userTraits: [
          "工作日午餐偏好",
          "近14天未午餐消费",
          `平均客单价 ¥${aov || 45}`,
          "办公场景到店/外卖",
        ],
        benefit: "工作日午餐套餐立减8元",
        benefitReason:
          "午餐决策窗口短、客单偏低，立减比高门槛满减更易促成「今天就点」；同时保护晚餐高客单不被同权稀释。",
        channels: [
          { name: "小程序", reason: "午间下单路径最短。" },
          { name: "企业微信", reason: "可针对写字楼社群定点推送。" },
          { name: "短信", reason: "覆盖未打开 App 的沉睡午餐用户。" },
        ],
        sendTime: "工作日 10:30",
        sendTimeReason: "午餐决策通常在 10:30–11:30 形成，提前触达可进入选择集合。",
        whyRecommended: `午餐订单连续走弱，但午餐偏好用户池仍有 ${count} 人。问题更可能是套餐吸引力与触达时机，而非完全失去需求。因此用「时段限定、低门槛立减」召回，而不是全天通用大额券。`,
        copySms: `【XX烧烤】今日午餐套餐立减8元，11:30前下单更快送达。回T退订`,
        copyWechat: `工作日午餐不想纠结？今日套餐立减8元，小程序一键下单，热乎到公司。`,
        copyPush: `午餐立减8元，10:30前下单更稳`,
        unitCost: 6,
        forecast: { claimRate: 40, redemptionRate: 52 },
      };

    case "arpu_lift":
    default:
      return {
        goal: "在月活基本稳定前提下，将 ARPU 提升约 5%。",
        targetAudience: opportunity.targetUsers,
        userTraits: [
          "潜力用户",
          "频次尚可、客单偏低",
          `平均客单价 ¥${aov || 75}`,
          `主要消费时段 ${timeSlot}`,
        ],
        benefit: "加价购：+15元升级双人畅享",
        benefitReason:
          "活跃稳定说明流量不是主问题；加价购能在不依赖新客的情况下直接抬升客单。",
        channels: [
          { name: "小程序", reason: "下单页原生加价购转化最高。" },
          { name: "公众号", reason: "用图文展示升级套餐对比。" },
        ],
        sendTime: "周五 16:00",
        sendTimeReason: "周末聚餐决策前推送，提高升级套餐接受度。",
        whyRecommended: `ARPU 下行而活跃平稳，说明应对「同一批用户卖得更好」。目标人群 ${count} 人频次不低但客单有空间，加价购比发折扣更能提升贡献且更护毛利。`,
        copySms: `【XX烧烤】本单可+15元升级双人畅享，份量升级不踩雷。回T退订`,
        copyWechat: `吃得不过瘾？+15元升级双人畅享套餐，烤串+配菜一次齐，周末聚餐更合适。`,
        copyPush: `+15元升级双人畅享，下单页可选`,
        unitCost: 5,
        forecast: { claimRate: 32, redemptionRate: 48 },
      };
  }
}

export { buildAIPortrait } from "./portrait";
