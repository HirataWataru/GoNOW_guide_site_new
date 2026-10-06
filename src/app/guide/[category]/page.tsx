import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleList, ContactBanner, PageHero } from "@/components/ui";
import { getArticles } from "@/lib/content";
import { GUIDE_CATEGORIES, findCategory } from "@/lib/content/taxonomy";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((c) => ({ category: c.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: findCategory(category)?.label };
}

export default async function GuideCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = GUIDE_CATEGORIES.find((c) => c.key === category);
  if (!cat) notFound();

  const [guides, faqs] = await Promise.all([getArticles(["guide"], cat.key), getArticles(["faq"], cat.key)]);
  const steps = GUIDE_CATEGORIES.filter((c) => c.step !== null);
  const idx = steps.findIndex((s) => s.key === cat.key);
  const prev = idx > 0 ? steps[idx - 1] : null;
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null;

  return (
    <>
      <PageHero
        title={cat.step ? `STEP ${String(cat.step).padStart(2, "0")}　${cat.label}` : cat.label}
        lead={cat.description}
        illustration={cat.illustration}
        crumbs={[{ href: "/guide", label: "ガイド" }, { label: cat.label }]}
      />
      <div className="mx-auto max-w-4xl space-y-12 px-4 pt-10">
        <section aria-labelledby="guides">
          <h2 id="guides" className="text-lg font-bold">
            操作ガイド・資料
          </h2>
          <div className="mt-3 rounded-2xl border border-line p-2">
            <ArticleList items={guides} />
          </div>
        </section>

        <section aria-labelledby="faqs">
          <h2 id="faqs" className="text-lg font-bold">
            よくある質問
          </h2>
          <div className="mt-3 rounded-2xl border border-line p-2">
            <ArticleList items={faqs} />
          </div>
        </section>

        {(prev || next) && (
          <nav aria-label="ステップの移動" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/guide/${prev.key}`} className="rounded-xl border-2 border-mist px-5 py-4 hover:border-brand-ink">
                <span className="block text-xs font-bold text-navy-soft">← 前のステップ</span>
                <span className="font-bold">STEP {String(prev.step).padStart(2, "0")}　{prev.label}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/guide/${next.key}`} className="rounded-xl border-2 border-mist px-5 py-4 text-right hover:border-brand-ink">
                <span className="block text-xs font-bold text-navy-soft">次のステップ →</span>
                <span className="font-bold">STEP {String(next.step).padStart(2, "0")}　{next.label}</span>
              </Link>
            )}
          </nav>
        )}
        <ContactBanner />
      </div>
    </>
  );
}
