"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import {
  createSimulatedCampaign,
  saveLocalCampaign,
} from "@/lib/growth/campaignStorage";
import type { MarketingStrategy, OpportunityId } from "@/types/growth";

export default function CreateCampaignButton({
  opportunityId,
  opportunityTitle,
  strategy,
  asOfDate,
  repeatRateBefore,
}: {
  opportunityId: OpportunityId;
  opportunityTitle: string;
  strategy: MarketingStrategy;
  asOfDate: string;
  repeatRateBefore: number;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  function handleCreate() {
    const campaign = createSimulatedCampaign({
      opportunityId,
      campaignName: `${opportunityTitle}执行计划`,
      targetSegment: strategy.targetAudience,
      targetUsers: strategy.targetUserCount,
      benefit: strategy.benefit,
      channels: strategy.channels.map((c) => c.name),
      sendTime: strategy.sendTime,
      reach: strategy.forecast.reach,
      claimRate: strategy.forecast.claimRate,
      redemptionRate: strategy.forecast.redemptionRate,
      gmv: strategy.forecast.gmv,
      cost: strategy.forecast.cost,
      repeatRateBefore,
      asOfDate,
    });
    saveLocalCampaign(campaign);
    setDone(true);
    router.push("/growth/campaigns");
  }

  return (
    <Button onClick={handleCreate} showArrow disabled={done}>
      {done ? "已创建，跳转中…" : "创建营销任务"}
    </Button>
  );
}
