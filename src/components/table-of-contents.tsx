"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

// ヘッダー（sticky）の高さ＋少しの余白。見出しがこの位置を過ぎたら「表示中」とみなす
const ACTIVE_OFFSET = 120;

/** スクロール位置に合わせて、いま読んでいる見出しを強調する目次 */
export function TableOfContents({
  items,
  titleId,
  variant = "rail",
}: {
  items: TocItem[];
  titleId: string;
  /** rail: 本文の右に固定する縦線つき／box: スマホで本文の上に出す枠つき */
  variant?: "rail" | "box";
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id ?? null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = item.id;
      }
      // ページの一番下まで来たら、最後の見出しを表示中にする
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = items.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav
      aria-labelledby={titleId}
      className={variant === "rail" ? "sticky top-24 border-l-2 border-mist pl-4" : "rounded-xl border border-line p-4"}
    >
      <h2 id={titleId} className="text-sm font-bold">
        この記事の内容
      </h2>
      <ol className="mt-2 space-y-0.5 text-sm">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={`block border-l-2 py-1 leading-snug transition-colors ${variant === "rail" ? "-ml-[18px] pl-4" : "pl-3"} ${
                  active
                    ? "border-brand-ink font-bold text-navy"
                    : "border-transparent text-navy-soft hover:text-brand-ink hover:underline"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
