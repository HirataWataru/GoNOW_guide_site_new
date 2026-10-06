import "server-only";
import { unstable_cache } from "next/cache";
import { fetchArticleBlocks, fetchArticleMetas, isNotionConfigured } from "./notion";
import { loadMarkdownArticles } from "./markdown";
import type { SearchItem } from "./search";
import type { Article, ArticleKind, ArticleMeta } from "./types";

// 記事の読み込み元：
//   - NOTION_TOKEN と NOTION_DATA_SOURCE_ID が設定されていれば Notion（5分ごとに取り直し。即時反映は /api/revalidate）
//   - 未設定なら content/ の Markdown（GitHub で編集 → デプロイで反映）
export const CONTENT_TAG = "articles";
const REVALIDATE_SECONDS = 300;

const cachedMetas = unstable_cache(fetchArticleMetas, ["article-metas"], {
  tags: [CONTENT_TAG],
  revalidate: REVALIDATE_SECONDS,
});

const cachedBlocks = unstable_cache(fetchArticleBlocks, ["article-blocks"], {
  tags: [CONTENT_TAG],
  revalidate: REVALIDATE_SECONDS,
});

export function contentSource(): "notion" | "markdown" {
  return isNotionConfigured() ? "notion" : "markdown";
}

// 本番ではファイルが変わらないので1回だけ読む。開発中は編集がすぐ見えるよう毎回読む
let markdownCache: Article[] | null = null;
function markdownArticles(): Article[] {
  if (process.env.NODE_ENV !== "production") return loadMarkdownArticles();
  return (markdownCache ??= loadMarkdownArticles());
}

function sortArticles(a: ArticleMeta, b: ArticleMeta) {
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title, "ja");
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const metas = isNotionConfigured()
    ? await cachedMetas()
    : markdownArticles().map(({ blocks, ...meta }) => meta);
  return [...metas].sort(sortArticles);
}

export async function getArticles(kinds: ArticleKind[], category?: string): Promise<ArticleMeta[]> {
  const all = await getAllArticles();
  return all.filter((a) => kinds.includes(a.kind) && (category === undefined || a.category === category));
}

/** お知らせ・TIPS は新しい順 */
export async function getNews(limit?: number): Promise<ArticleMeta[]> {
  const items = (await getArticles(["news", "tips"])).sort((a, b) =>
    (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt),
  );
  return limit ? items.slice(0, limit) : items;
}

export async function getArticle(slug: string): Promise<Article | null> {
  const meta = (await getAllArticles()).find((a) => a.slug === slug);
  if (!meta) return null;
  if (!isNotionConfigured()) return markdownArticles().find((a) => a.id === meta.id) ?? null;
  return { ...meta, blocks: await cachedBlocks(meta.id) };
}

/** ブラウザ側の検索候補に渡す最小限のデータ */
export async function getSearchItems(): Promise<SearchItem[]> {
  return (await getAllArticles()).map(({ id, slug, title, kind, keywords, summary, externalUrl }) => ({
    id,
    slug,
    title,
    kind,
    keywords,
    summary,
    externalUrl,
  }));
}

export { articleHref, isExternalLink, normalize, searchArticles } from "./search";
