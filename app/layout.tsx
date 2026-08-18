import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 餐饮经营诊断助手",
  description: "让餐饮经营者不用自己分析复杂报表，也能知道门店发生了什么、为什么发生以及下一步应该做什么。",
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
          <main className="pl-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
