import type { Metadata } from "next";
import { Illustration } from "@/components/illustration";
import { ArticleList, PageHero } from "@/components/ui";
import { getArticles } from "@/lib/content";
import { RESOURCE_CATEGORIES } from "@/lib/content/taxonomy";

export const metadata: Metadata = { title: "資料・フォーム" };

export default async function ResourcesPage() {
  const items = await getArticles(["resource"]);

  return (
    <>
      <PageHero
        title="資料・フォーム"
        lead="各種お申し込みフォーム、資料、規約をまとめています。"
        crumbs={[{ label: "資料・フォーム" }]}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-10 md:grid-cols-2">
        {RESOURCE_CATEGORIES.map((c) => {
          const list = items.filter((i) => i.category === c.key);
          if (!list.length) return null;
          return (
            <section key={c.key} id={c.key} aria-labelledby={`${c.key}-title`} className="rounded-2xl border border-line">
              <h2 id={`${c.key}-title`} className="flex items-center gap-3 rounded-t-2xl bg-cloud px-5 py-4 text-lg font-bold">
                <Illustration name={c.illustration} size={32} />
                {c.label}
              </h2>
              <div className="p-2">
                <ArticleList items={list} />
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
