"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { SearchBox } from "./search-box";
import type { SearchItem } from "@/lib/content/search";

const NAV = [
  { href: "/guide", label: "ガイド" },
  { href: "/faq", label: "よくある質問" },
  { href: "/news", label: "お知らせ・TIPS" },
  { href: "/resources", label: "資料・フォーム" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="rounded-md bg-brand px-2 py-0.5 text-lg font-bold tracking-tight text-white italic">GoNOW</span>
      <span className="text-[15px] font-bold whitespace-nowrap text-navy">ご利用ガイド</span>
    </span>
  );
}

export function SiteHeader({ suggestions }: { suggestions: SearchItem[] }) {
  const pathname = usePathname();
  // メニューを開いたときのパスを覚えておき、ページを移動したら自動で閉じた扱いにする
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname;
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" aria-label="GoNOW ご利用ガイド トップ">
          <Logo />
        </Link>

        <nav aria-label="メイン" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV.map((n) => {
              const current = pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={current ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-bold hover:bg-cloud ${
                      current ? "text-brand-ink underline decoration-2 underline-offset-8" : "text-navy"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* トップページは大きな検索窓があるのでヘッダーには出さない */}
        {!isHome && (
          <div className="ml-auto hidden w-72 lg:block">
            <SearchBox items={suggestions} />
          </div>
        )}

        <button
          type="button"
          className="ml-auto rounded-md p-2 text-navy md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setOpenedAt(menuOpen ? null : pathname)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
          <span className="sr-only">{menuOpen ? "メニューを閉じる" : "メニューを開く"}</span>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-white px-4 pt-4 pb-6 md:hidden">
          <SearchBox items={suggestions} />
          <nav aria-label="メイン（モバイル）" className="mt-4">
            <ul className="divide-y divide-line">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex items-center justify-between py-3.5 font-bold text-navy">
                    {n.label}
                    <Icon name="arrowRight" size={16} className="text-navy-soft" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
