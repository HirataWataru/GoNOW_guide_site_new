import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Blocks } from "@/components/blocks";
import { TableOfContents } from "@/components/table-of-contents";
import { Icon } from "@/components/icons";
import { ArticleList, ContactBanner, PageHero, formatDate, type Crumb } from "@/components/ui";
import { getAllArticles, getArticle } from "@/lib/content";
import { KINDS, findCategory } from "@/lib/content/taxonomy";
import type { Block } from "@/lib/content/types";

type Heading = Extract<Block, { type: "h2" | "h3" }>;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllArticles()).filter((a) => !a.externalUrl).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = (await getAllArticles()).find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.summary || undefined } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  // 本文を持たないリンク記事は、リンク先へそのまま案内する
  if (article.externalUrl) redirect(article.externalUrl);

  const kind = KINDS[article.kind];
  const category = findCategory(article.category);
  const crumbs: Crumb[] = [{ href: kind.path, label: kind.label }];
  if (category && (article.kind === "guide" || article.kind === "faq")) {
    crumbs.splice(0, 1, { href: "/guide", label: "ガイド" }, { href: `/guide/${category.key}`, label: category.label });
  }
  crumbs.push({ label: article.title });

  const toc = article.blocks
    .filter((b): b is Heading => b.type === "h2")
    .map((h) => ({ id: h.id, label: h.text.map((r) => r.text).join("") }));
  const related = category
    ? (await getAllArticles()).filter(
        (a) => a.id !== article.id && a.category === category.key && (a.kind === "guide" || a.kind === "faq"),
      )
    : [];
  const date = article.publishedAt ?? article.updatedAt;

  return (
    <>
      <PageHero title={article.title} crumbs={crumbs}>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white">
          <span className="rounded bg-white/20 px-2 py-0.5 font-bold">{kind.label}</span>
          {article.publishedAt && <span>公開日：{formatDate(article.publishedAt)}</span>}
          <span className="flex items-center gap-1">
            <Icon name="clock" size={14} />
            最終更新：<time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
          </span>
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_16rem]">
        <article className="min-w-0">
          {article.summary && (
            <p className="mb-8 rounded-xl bg-cloud px-5 py-4 leading-relaxed font-medium">{article.summary}</p>
          )}

          {toc.length > 2 && (
            <div className="mb-8 lg:hidden">
              <TableOfContents items={toc} titleId="toc-mobile" variant="box" />
            </div>
          )}

          <div className="prose-gonow">
            <Blocks blocks={article.blocks} />
          </div>

          <p className="mt-12 text-right text-xs text-navy-soft">
            {date !== article.updatedAt && `公開 ${formatDate(date)}／`}最終更新 {formatDate(article.updatedAt)}
          </p>

          <div className="mt-8">
            <ContactBanner />
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-12">
              <h2 id="related-title" className="text-lg font-bold">
                「{category!.label}」のほかの記事
              </h2>
              <div className="mt-3 rounded-2xl border border-line p-2">
                <ArticleList items={related.slice(0, 6)} showKind />
              </div>
            </section>
          )}
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <TableOfContents items={toc} titleId="toc" />
          </aside>
        )}
      </div>
    </>
  );
}

