import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import UserPortraitPanel from "@/components/growth/UserPortraitPanel";
import { getGrowthDataset } from "@/lib/growth/dataset";
import { getUsersBySegment } from "@/lib/growth/metrics";
import { getSegmentMeta } from "@/lib/growth/rfm";
import type { SegmentId } from "@/types/growth";

const SEGMENT_IDS: SegmentId[] = [
  "high_value",
  "potential",
  "new",
  "dormant",
  "churn_risk",
];

export function generateStaticParams() {
  return SEGMENT_IDS.map((segmentId) => ({ segmentId }));
}

export default async function SegmentDetailPage({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) {
  const { segmentId } = await params;
  if (!SEGMENT_IDS.includes(segmentId as SegmentId)) notFound();

  const id = segmentId as SegmentId;
  const meta = getSegmentMeta(id);
  const allUsers = getUsersBySegment(id);
  const totalInSegment = allUsers.length;
  const users = allUsers.slice(0, 100);
  const { asOfDate } = getGrowthDataset();

  return (
    <>
      <Header date={asOfDate} />
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm">
              <Link href="/growth/segments" className="text-brand-700 hover:underline">
                ← 返回分层
              </Link>
            </p>
            <h2 className="mt-2 text-xl font-bold text-stone-900">
              {meta.name}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {meta.description} · 共 {totalInSegment.toLocaleString("zh-CN")} 人（明细展示前{" "}
              {users.length}）· 推荐：{meta.strategy}
            </p>
          </div>
        </div>

        <UserPortraitPanel users={users} asOfDate={asOfDate} />
      </div>
    </>
  );
}
