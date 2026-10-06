import type { Metadata } from "next";
import { ArticleList, ContactBanner, PageHero } from "@/components/ui";
import { getArticles } from "@/lib/content";
import { GUIDE_CATEGORIES } from "@/lib/content/taxonomy";
import { Illustration } from "@/components/illustration";

export const metadata: Metadata = { title: "よくある質問" };

export default async function FaqPage() {
  const faqs = await getArticles(["faq"]);
  const groups = GUIDE_CATEGORIES.map((c) => ({ ...c, items: faqs.filter((f) => f.category === c.key) })).filter(
    (g) => g.items.length > 0,
  );
  const uncategorized = faqs.filter((f) => !GUIDE_CATEGORIES.some((c) => c.key === f.category));

  return (
    <>
      <PageHero title="よくある質問" lead="お問い合わせの多いご質問と回答をまとめています。" crumbs={[{ label: "よくある質問" }]} />
      <div className="mx-auto max-w-4xl space-y-10 px-4 pt-10">
        <nav aria-label="カテゴリ">
          <ul className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.key}>
                <a href={`#${g.key}`} className="inline-block rounded-full border-2 border-mist px-4 py-1.5 text-sm font-bold hover:border-brand-ink hover:text-brand-ink">
                  {g.label}（{g.items.length}）
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((g) => (
          <section key={g.key} id={g.key} aria-labelledby={`${g.key}-title`}>
            <h2 id={`${g.key}-title`} className="flex items-center gap-2.5 text-lg font-bold">
              <Illustration name={g.illustration} size={32} />
              {g.label}
            </h2>
            <div className="mt-3 rounded-2xl border border-line p-2">
              <ArticleList items={g.items} />
            </div>
          </section>
        ))}

        {uncategorized.length > 0 && (
          <section aria-labelledby="other-title">
            <h2 id="other-title" className="text-lg font-bold">
              その他
            </h2>
            <div className="mt-3 rounded-2xl border border-line p-2">
              <ArticleList items={uncategorized} />
            </div>
          </section>
        )}
        <ContactBanner />
      </div>
    </>
  );
}
