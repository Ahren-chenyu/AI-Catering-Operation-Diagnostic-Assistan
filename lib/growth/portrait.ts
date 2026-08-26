import type { AIPortrait, GrowthUser } from "@/types/growth";
import { daysBetween } from "./seed";

/** AI 用户画像：严格引用用户字段，不编造冲突数据 */
export function buildAIPortrait(
  user: GrowthUser,
  asOfDate: string
): AIPortrait {
  const freqDrop =
    user.ordersPrev60 > 0
      ? Math.round(
          (1 - user.ordersLast30 / Math.max(user.ordersPrev60 / 2, 0.5)) * 100
        )
      : 0;

  const monthlyApprox =
    user.orderCount > 0
      ? Math.round(
          (user.orderCount /
            Math.max(daysBetween(user.firstOrderDate, asOfDate) / 30, 1)) *
            10
        ) / 10
      : 0;

  let summary = `该用户属于${user.valueTier}${user.lifecycleStage}。`;
  if (user.segmentId === "churn_risk" || freqDrop > 30) {
    summary = `该用户属于${user.valueTier}但近期活跃度下降用户。过去阶段大约每月消费 ${monthlyApprox} 次，最近30天仅消费 ${user.ordersLast30} 次${freqDrop > 0 ? `，消费频率下降约 ${freqDrop}%` : ""}。主要消费时间集中于${user.preferredTime === "午餐" ? "工作日午餐" : user.preferredTime}，对优惠券敏感度${user.couponSensitivity === "高" ? "较高" : user.couponSensitivity === "低" ? "较低" : "中等"}。`;
  } else if (user.segmentId === "new") {
    summary = `该用户为新客，首购于 ${user.firstOrderDate}，至今消费 ${user.orderCount} 次，累计 ¥${user.totalSpend}。偏好${user.favoriteCategory}，常用时段为${user.preferredTime}，优惠敏感度${user.couponSensitivity}。`;
  } else if (user.segmentId === "high_value") {
    summary = `该用户为高价值成熟用户：近${user.recencyDays}天内有消费，累计消费 ${user.orderCount} 次、¥${user.totalSpend}，客单价约 ¥${user.avgOrderValue}。偏好${user.preferredTime}场景下的${user.favoriteCategory}，优惠敏感度${user.couponSensitivity}。`;
  } else if (user.segmentId === "dormant") {
    summary = `该用户已沉睡 ${user.recencyDays} 天未消费。历史共 ${user.orderCount} 单、累计 ¥${user.totalSpend}。曾偏好${user.preferredTime}/${user.favoriteCategory}，适合做唤醒召回。`;
  } else {
    summary = `该用户为潜力用户：近${user.recencyDays}天有互动，频次 ${user.orderCount} 次，客单价 ¥${user.avgOrderValue}，累计 ¥${user.totalSpend}。仍有提客单空间，偏好${user.preferredTime}。`;
  }

  return {
    summary,
    bullets: [
      `分层：${user.segmentId} · 生命周期 ${user.lifecycleStage} · 价值 ${user.valueTier}`,
      `RFM：R=${user.recencyDays}天 · F=${user.frequency}次 · M=¥${user.monetary}`,
      `偏好：${user.favoriteCategory} · ${user.preferredTime} · ${user.channel}`,
      `标签：${user.tags.join("、") || "—"}`,
    ],
  };
}
