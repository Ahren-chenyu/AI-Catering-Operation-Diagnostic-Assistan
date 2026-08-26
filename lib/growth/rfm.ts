import type { GrowthUser, SegmentId, SegmentSummary } from "@/types/growth";
import { calcRepeatRate } from "./calc";

const SEGMENT_META: Record<
  SegmentId,
  { name: string; description: string; strategy: string; recommendedAction: string }
> = {
  high_value: {
    name: "高价值用户",
    description: "最近消费、高频消费、高消费金额",
    strategy: "VIP权益 / 专属新品 / 高价值会员运营",
    recommendedAction: "维护权益与专属触达",
  },
  potential: {
    name: "潜力用户",
    description: "消费频率较高，但客单价仍有提升空间",
    strategy: "套餐升级 / 加价购 / 关联商品推荐",
    recommendedAction: "提客单组合推荐",
  },
  new: {
    name: "新用户",
    description: "首次消费时间较短，消费次数较少",
    strategy: "首购转复购策略",
    recommendedAction: "7–14天二次触达",
  },
  dormant: {
    name: "沉睡用户",
    description: "较长时间没有消费",
    strategy: "用户召回",
    recommendedAction: "唤醒优惠召回",
  },
  churn_risk: {
    name: "流失风险用户",
    description: "过去属于活跃/高价值，但近期消费频率明显下降",
    strategy: "定向召回 / 个性化权益",
    recommendedAction: "高价值挽留方案",
  },
};

export function buildSegmentSummaries(users: GrowthUser[]): SegmentSummary[] {
  const total = users.length || 1;
  const ids: SegmentId[] = ["high_value", "potential", "new", "dormant", "churn_risk"];

  return ids.map((id) => {
    const group = users.filter((u) => u.segmentId === id);
    const userCount = group.length;
    const share = Math.round((userCount / total) * 1000) / 10;
    const revenue = group.reduce((s, u) => s + u.totalSpend, 0);
    const arpu = userCount > 0 ? Math.round((revenue / userCount) * 10) / 10 : 0;
    const repeatRate = calcRepeatRate(group);
    const meta = SEGMENT_META[id];

    let status: SegmentSummary["status"] = "健康";
    if (id === "churn_risk" || (id === "new" && repeatRate < 22)) status = "风险";
    else if (id === "dormant" || (id === "potential" && arpu < 180)) status = "关注";

    return {
      id,
      name: meta.name,
      description: meta.description,
      strategy: meta.strategy,
      userCount,
      share,
      arpu,
      repeatRate,
      status,
      recommendedAction: meta.recommendedAction,
    };
  });
}

export function getSegmentMeta(id: SegmentId) {
  return SEGMENT_META[id];
}
