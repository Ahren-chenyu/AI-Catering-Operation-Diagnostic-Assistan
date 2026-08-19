"use client";

import { useRouter } from "next/navigation";
import { appendActionRound } from "@/lib/client/actionRoundStorage";
import Button from "@/components/ui/Button";
import type { ActionPlanViewModel } from "@/types";

interface StartActionButtonProps {
  storeId: string;
  plan: ActionPlanViewModel;
  disabled?: boolean;
}

export default function StartActionButton({
  storeId,
  plan,
  disabled,
}: StartActionButtonProps) {
  const router = useRouter();

  function handleStart() {
    appendActionRound(storeId, plan);
    router.push("/review-records");
  }

  return (
    <Button
      variant="primary"
      showArrow
      disabled={disabled}
      onClick={handleStart}
    >
      开始行动
    </Button>
  );
}
