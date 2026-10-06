import type { Metadata } from "next";
import Link from "next/link";
import { IllustrationTile } from "@/components/illustration";
import { ArticleList, ContactBanner, PageHero } from "@/components/ui";
import { getArticles } from "@/lib/content";
import { GUIDE_CATEGORIES } from "@/lib/content/taxonomy";

export const metadata: Metadata = { title: "ガイド" };

export default async function GuideIndex() {
  const articles = await getArticles(["guide", "faq"]);

  return (
    <>
      <PageHero title="ガイド" lead="導入の流れ・目的ごとに、操作ガイドとよくある質問をまとめています。" crumbs={[{ label: "ガイド" }]} />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pt-10">
        <nav aria-label="カテゴリ">
          <ul className="flex flex-wrap gap-2">
            {GUIDE_CATEGORIES.map((c) => (
              <li key={c.key}>
                <a href={`#${c.key}`} className="inline-block rounded-full border-2 border-mist px-4 py-1.5 text-sm font-bold hover:border-brand-ink hover:text-brand-ink">
                  {c.step && <span className="mr-1 text-brand-ink">STEP{c.step}</span>}
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          {GUIDE_CATEGORIES.map((c) => {
            const items = articles.filter((a) => a.category === c.key);
            return (
              <section key={c.key} id={c.key} aria-labelledby={`${c.key}-title`} className="rounded-2xl border border-line">
                <div className="flex items-center gap-4 rounded-t-2xl bg-brand-ink px-5 py-4 text-white">
                  <IllustrationTile name={c.illustration} size={36} className="p-1.5" />
                  <div className="min-w-0 flex-1">
                    {c.step && <p className="text-xs font-bold tracking-widest">STEP {String(c.step).padStart(2, "0")}</p>}
                    <h2 id={`${c.key}-title`} className="text-lg font-bold">
                      {c.label}
                    </h2>
                  </div>
                </div>
                <div className="p-2">
                  <ArticleList items={items.slice(0, 5)} showKind />
                </div>
                <div className="border-t border-line px-5 py-3 text-right">
                  <Link href={`/guide/${c.key}`} className="text-sm font-bold text-brand-ink hover:underline">
                    {c.label}の記事をすべて見る（{items.length}件）→
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
        <ContactBanner />
      </div>
    </>
  );
}
