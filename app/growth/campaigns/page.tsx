import Header from "@/components/layout/Header";
import CampaignsClient from "@/components/growth/CampaignsClient";
import { getCampaigns } from "@/lib/growth/reviewEngine";
import { GROWTH_AS_OF } from "@/lib/growth/dataset";

export default function CampaignsPage() {
  const demoCampaigns = getCampaigns();

  return (
    <>
      <Header date={GROWTH_AS_OF} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900">营销策略与复盘</h2>
          <p className="mt-1 text-sm text-stone-500">
            演示活动来自统一数据集（含已结束的「新客7日复购提升计划」）；本地创建的任务保存在浏览器
            localStorage。
          </p>
        </div>
        <CampaignsClient demoCampaigns={demoCampaigns} />
      </div>
    </>
  );
}
