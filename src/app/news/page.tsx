import type { Metadata } from "next";
import Link from "next/link";
import { ArticleList, PageHero } from "@/components/ui";
import { getNews } from "@/lib/content";

export const metadata: Metadata = { title: "お知らせ・TIPS" };

type Props = { searchParams: Promise<{ type?: string }> };

const TABS = [
  { key: undefined, label: "すべて" },
  { key: "news", label: "お知らせ" },
  { key: "tips", label: "TIPS" },
] as const;

export default async function NewsPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const items = (await getNews()).filter((a) => !type || a.kind === type);

  return (
    <>
      <PageHero
        title="お知らせ・TIPS"
        lead="リリース情報・イベントのご案内と、GoNOW をもっと便利に使うための TIPS です。"
        crumbs={[{ label: "お知らせ・TIPS" }]}
      />
      <div className="mx-auto max-w-4xl px-4 pt-10">
        <nav aria-label="絞り込み">
          <ul className="flex gap-2">
            {TABS.map((t) => {
              const current = (type ?? undefined) === t.key;
              return (
                <li key={t.label}>
                  <Link
                    href={t.key ? `/news?type=${t.key}` : "/news"}
                    aria-current={current ? "page" : undefined}
                    className={`inline-block rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                      current ? "border-brand-ink bg-brand-ink text-white" : "border-mist hover:border-brand-ink hover:text-brand-ink"
                    }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-6 rounded-2xl border border-line p-2">
          <ArticleList items={items} showKind showDate />
        </div>
      </div>
    </>
  );
}
