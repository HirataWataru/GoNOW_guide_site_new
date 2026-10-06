import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { ArticleList, ContactBanner, PageHero } from "@/components/ui";
import { getAllArticles, getSearchItems, searchArticles } from "@/lib/content";

export const metadata: Metadata = { title: "検索結果", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const [all, searchItems] = await Promise.all([getAllArticles(), getSearchItems()]);
  const results = searchArticles(all, q);

  return (
    <>
      <PageHero title={q ? `「${q}」の検索結果` : "キーワードで探す"} crumbs={[{ label: "検索" }]}>
        <div className="mt-6 max-w-2xl">
          <SearchBox key={q} items={searchItems} size="lg" defaultValue={q} />
        </div>
      </PageHero>
      <div className="mx-auto max-w-4xl space-y-10 px-4 pt-10">
        {q && (
          <section aria-live="polite">
            <p className="text-sm font-bold">{results.length}件見つかりました</p>
            {results.length > 0 ? (
              <div className="mt-3 rounded-2xl border border-line p-2">
                <ArticleList items={results} showKind />
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-line p-6 text-sm leading-relaxed">
                <p>該当する記事が見つかりませんでした。</p>
                <ul className="mt-2 list-disc pl-5 text-navy-soft">
                  <li>別の言葉や、短いキーワードでお試しください（例：「タンク」「グラフ」）</li>
                  <li>
                    <Link href="/guide" className="text-brand-ink underline">
                      ガイド
                    </Link>
                    や
                    <Link href="/faq" className="text-brand-ink underline">
                      よくある質問
                    </Link>
                    の一覧からも探せます
                  </li>
                </ul>
              </div>
            )}
          </section>
        )}
        <ContactBanner />
      </div>
    </>
  );
}
