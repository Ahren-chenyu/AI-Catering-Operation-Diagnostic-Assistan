"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

type NavSection = {
  id: string;
  label: string;
  match: (pathname: string) => boolean;
  links: NavLink[];
};

const sections: NavSection[] = [
  {
    id: "docs",
    label: "产品说明书",
    match: (pathname) =>
      pathname === "/about" ||
      pathname.startsWith("/growth/architecture") ||
      pathname.startsWith("/growth/path"),
    links: [
      { href: "/about", label: "项目说明" },
      { href: "/growth/architecture", label: "AI架构" },
      { href: "/growth/path", label: "增长路径" },
    ],
  },
  {
    id: "diagnosis",
    label: "经营诊断中心",
    match: (pathname) =>
      pathname === "/dashboard" ||
      pathname.startsWith("/diagnosis") ||
      pathname.startsWith("/action-plan") ||
      pathname.startsWith("/review-records"),
    links: [
      { href: "/dashboard", label: "自动汇报" },
      { href: "/diagnosis", label: "经营诊断" },
      { href: "/action-plan", label: "行动指南" },
      { href: "/review-records", label: "经营复盘" },
    ],
  },
  {
    id: "growth",
    label: "用户增长中心",
    match: (pathname) =>
      pathname === "/growth" ||
      pathname.startsWith("/growth/segments") ||
      pathname.startsWith("/growth/opportunities") ||
      pathname.startsWith("/growth/campaigns") ||
      pathname.startsWith("/growth/strategy"),
    links: [
      { href: "/growth", label: "用户分析" },
      { href: "/growth/segments", label: "用户分层" },
      { href: "/growth/opportunities", label: "增长机会" },
      { href: "/growth/campaigns", label: "营销策略与复盘" },
    ],
  },
];

function linkActive(pathname: string, href: string) {
  if (href === "/growth") return pathname === "/growth";
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/about") return pathname === "/about";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) {
      init[s.id] = s.match(pathname);
    }
    // 默认展开经营诊断中心
    if (!Object.values(init).some(Boolean)) {
      init.diagnosis = true;
    }
    return init;
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setOpenMap((prev) => {
      const next = { ...prev };
      for (const s of sections) {
        if (s.match(pathname)) next[s.id] = true;
      }
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
          aria-label="打开导航菜单"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-stone-900">AI餐饮经营助手</p>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-stone-900/40 md:hidden"
          aria-label="关闭导航菜单"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">AI餐饮经营助手</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 md:hidden"
            aria-label="关闭导航菜单"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const sectionActive = section.match(pathname);
            const open = openMap[section.id] ?? sectionActive;
            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMap((prev) => ({
                      ...prev,
                      [section.id]: !prev[section.id],
                    }))
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                    sectionActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                  )}
                >
                  <span className="flex-1 text-left normal-case tracking-normal">
                    {section.label}
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 text-stone-400 transition-transform",
                      open && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {open && (
                  <div className="mt-1 space-y-0.5 border-l border-stone-200 ml-3 pl-2">
                    {section.links.map((link) => {
                      const active = linkActive(pathname, link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-brand-50 font-medium text-brand-700"
                              : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="rounded-lg bg-surface-muted px-3 py-2.5">
            <p className="text-xs font-medium text-stone-500">AI Agent 状态</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs text-stone-700">经营诊断 · 增长策略协同中</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
