"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { KINDS } from "@/lib/content/taxonomy";
import { articleHref, isExternalLink, searchArticles, type SearchItem } from "@/lib/content/search";

export function SearchBox({
  items,
  size = "md",
  defaultValue = "",
  autoFocus = false,
}: {
  items: SearchItem[];
  size?: "md" | "lg";
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchArticles(items, query).slice(0, 6), [items, query]);
  const showList = open && query.trim() !== "" && results.length > 0;

  function go(item: SearchItem) {
    setOpen(false);
    const href = articleHref(item);
    if (isExternalLink(item)) window.open(href, "_blank", "noopener");
    else if (href.startsWith("/files/")) window.location.assign(href);
    else router.push(href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (showList && active >= 0) return go(results[active]);
    if (!query.trim()) return inputRef.current?.focus();
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const lg = size === "lg";

  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">
        キーワードで探す
      </label>
      <div
        className={`flex items-center gap-2 rounded-full border-2 bg-white transition-colors focus-within:border-brand-ink ${
          lg ? "border-white px-5 py-3 shadow-lg shadow-navy/10" : "border-line px-4 py-1.5"
        }`}
      >
        <Icon name="search" size={lg ? 24 : 18} className="shrink-0 text-navy-soft" />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder={lg ? "例：しきい値、タンクタイプ、顧客 削除" : "キーワードで探す"}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          className={`min-w-0 flex-1 bg-transparent text-navy placeholder:text-navy-soft/80 focus:outline-none ${
            lg ? "text-lg" : "text-sm"
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-full bg-brand-ink font-bold text-white hover:bg-navy ${
            lg ? "px-6 py-2 text-base" : "px-3 py-1 text-xs"
          }`}
        >
          検索
        </button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="検索候補"
          className={`absolute top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-white text-left shadow-xl shadow-navy/15 ${
            lg ? "inset-x-0" : "right-0 w-[min(30rem,calc(100vw-2rem))]"
          }`}
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                go(r);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${i === active ? "bg-cloud" : ""}`}
            >
              <span className="mt-0.5 shrink-0 rounded bg-mist px-1.5 py-0.5 text-[11px] font-bold text-navy">
                {KINDS[r.kind].label}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-navy">{r.title}</span>
                {r.summary && <span className="mt-0.5 line-clamp-1 text-xs text-navy-soft">{r.summary}</span>}
              </span>
              {isExternalLink(r) && <Icon name="external" size={14} className="mt-1 ml-auto shrink-0 text-navy-soft" />}
            </li>
          ))}
          <li className="border-t border-line bg-cloud px-4 py-2 text-xs text-navy-soft">
            Enter ですべての検索結果を表示
          </li>
        </ul>
      )}
    </form>
  );
}
