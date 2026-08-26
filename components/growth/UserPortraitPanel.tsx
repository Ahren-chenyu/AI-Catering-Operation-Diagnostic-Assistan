"use client";

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { buildAIPortrait } from "@/lib/growth/portrait";
import type { GrowthUser } from "@/types/growth";

export default function UserPortraitPanel({
  users,
  asOfDate,
}: {
  users: GrowthUser[];
  asOfDate: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    users[0]?.userId ?? null
  );
  const selected = users.find((u) => u.userId === selectedId) ?? null;
  const portrait = selected ? buildAIPortrait(selected, asOfDate) : null;

  const display = users.slice(0, 80);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-card lg:col-span-3">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-surface-muted text-xs font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-3 py-2.5">用户ID</th>
                <th className="px-3 py-2.5">最近消费</th>
                <th className="px-3 py-2.5">频次</th>
                <th className="px-3 py-2.5">累计消费</th>
                <th className="px-3 py-2.5">客单价</th>
                <th className="px-3 py-2.5">偏好</th>
                <th className="px-3 py-2.5">敏感度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {display.map((u) => (
                <tr
                  key={u.userId}
                  onClick={() => setSelectedId(u.userId)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedId === u.userId
                      ? "bg-brand-50"
                      : "hover:bg-stone-50"
                  )}
                >
                  <td className="px-3 py-2 font-medium text-stone-900">
                    {u.userId}
                  </td>
                  <td className="px-3 py-2 text-stone-600">
                    {u.lastOrderDate}
                    <span className="ml-1 text-xs text-stone-400">
                      ({u.recencyDays}天前)
                    </span>
                  </td>
                  <td className="px-3 py-2 text-stone-700">{u.orderCount}</td>
                  <td className="px-3 py-2 text-stone-700">
                    {formatCurrency(u.totalSpend)}
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    {formatCurrency(u.avgOrderValue)}
                  </td>
                  <td className="px-3 py-2 text-stone-600">
                    <span className="block truncate max-w-[120px]">
                      {u.favoriteCategory}
                    </span>
                    <span className="text-xs text-stone-400">
                      {u.preferredTime} · {u.channel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    {u.couponSensitivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length > display.length && (
          <p className="border-t border-stone-100 px-4 py-2 text-xs text-stone-500">
            展示前 {display.length} / {users.length} 人（演示分页）
          </p>
        )}
      </div>

      <div className="lg:col-span-2">
        {selected && portrait ? (
          <div className="sticky top-20 space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-card">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                AI 用户画像
              </p>
              <h3 className="mt-1 text-base font-semibold text-stone-900">
                {selected.userId}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-stone-700">
              {portrait.summary}
            </p>
            <ul className="space-y-2">
              {portrait.bullets.map((b, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-surface-muted px-3 py-2 text-xs leading-relaxed text-stone-600"
                >
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-1.5">
              {selected.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              画像仅引用当前用户字段，不编造冲突数据。
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            点击左侧用户查看 AI 画像
          </div>
        )}
      </div>
    </div>
  );
}
