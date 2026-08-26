import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI餐饮经营与增长助手",
  description:
    "经营诊断 + 用户增长闭环：发现问题 → 定位用户 → AI 策略 → 执行模拟 → 效果复盘。",
  appleWebApp: {
    capable: true,
    title: "AI餐饮经营与增长助手",
  },
  other: {
    "format-detection": "telephone=no, email=no, address=no",
    "x5-orientation": "portrait",
    "x5-fullscreen": "true",
    "x5-page-mode": "app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen">
          <Sidebar />
          <main className="min-w-0 pt-14 md:pt-0 md:pl-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
