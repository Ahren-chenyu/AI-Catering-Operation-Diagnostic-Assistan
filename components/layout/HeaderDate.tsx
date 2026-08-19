"use client";

export default function HeaderDate() {
  const formattedDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return <span suppressHydrationWarning>{formattedDate}</span>;
}
