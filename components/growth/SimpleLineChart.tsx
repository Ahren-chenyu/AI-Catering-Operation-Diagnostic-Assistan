"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// lightweight SVG chart — no extra chart dependency

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueSuffix?: string;
  currency?: boolean;
}

export default function SimpleLineChart({
  data,
  height = 200,
  color = "#ed7120",
  valueSuffix = "",
  currency = false,
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const padding = { top: 16, right: 12, bottom: 28, left: 40 };
  const width = 640;

  const { points, minV, maxV, path } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const span = max - min || 1;
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const pts = data.map((d, i) => {
      const x =
        padding.left +
        (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
      const y = padding.top + innerH - ((d.value - min) / span) * innerH;
      return { x, y, ...d };
    });

    const dPath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    return { points: pts, minV: min, maxV: max, path: dPath };
  }, [data, height]);

  const fmt = (v: number) =>
    currency ? `¥${v.toLocaleString("zh-CN")}` : `${v}${valueSuffix}`;

  const labelIndexes = useMemo(() => {
    if (data.length <= 6) return data.map((_, i) => i);
    const step = Math.ceil(data.length / 5);
    const idxs = [0];
    for (let i = step; i < data.length - 1; i += step) idxs.push(i);
    idxs.push(data.length - 1);
    return idxs;
  }, [data]);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[320px]"
        role="img"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y =
            padding.top +
            (height - padding.top - padding.bottom) * (1 - t);
          const val = minV + (maxV - minV) * t;
          return (
            <g key={t}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e7e5e4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-stone-400"
                fontSize={10}
              >
                {fmt(Math.round(val * 10) / 10)}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke={color} strokeWidth={2} />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 4.5 : 2.5}
            fill={color}
            className="cursor-pointer"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {labelIndexes.map((i) => (
          <text
            key={i}
            x={points[i]!.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-stone-400"
            fontSize={10}
          >
            {data[i]!.label}
          </text>
        ))}

        {hover !== null && points[hover] && (
          <g>
            <rect
              x={Math.min(points[hover].x - 40, width - 90)}
              y={points[hover].y - 36}
              width={80}
              height={28}
              rx={6}
              fill="#1c1917"
            />
            <text
              x={Math.min(points[hover].x - 40, width - 90) + 40}
              y={points[hover].y - 18}
              textAnchor="middle"
              fill="#fff"
              fontSize={11}
            >
              {points[hover].label}: {fmt(points[hover].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200 bg-white p-5 shadow-card",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
