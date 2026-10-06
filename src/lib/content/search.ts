import type { ArticleMeta } from "./types";

// サーバー・クライアントの両方で使う（ヘッダーの検索候補はブラウザ側で絞り込む）

export type SearchItem = Pick<ArticleMeta, "id" | "slug" | "title" | "kind" | "keywords" | "summary" | "externalUrl">;

/** 全角・半角、大文字・小文字、カタカナ・ひらがなの違いを吸収する */
export function normalize(s: string) {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function searchArticles<T extends SearchItem>(articles: T[], query: string): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = articles.map((a) => {
    const title = normalize(a.title);
    const keywords = normalize(a.keywords.join(" "));
    const summary = normalize(a.summary);
    let score = 0;
    for (const term of terms) {
      const hit = (title.includes(term) ? 5 : 0) + (keywords.includes(term) ? 3 : 0) + (summary.includes(term) ? 1 : 0);
      // すべての語を含むものだけを結果にする（AND 検索）
      if (hit === 0) return { a, score: 0 };
      score += hit;
    }
    return { a, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((s) => s.a);
}

/** 外部リンクが https:// のときだけ新しいタブで開く（/articles/... などのサイト内リンクは同じタブ） */
export function isExternalLink(a: Pick<ArticleMeta, "externalUrl">) {
  return Boolean(a.externalUrl && /^https?:\/\//.test(a.externalUrl));
}

export function articleHref(a: Pick<ArticleMeta, "slug" | "externalUrl">) {
  return a.externalUrl ?? `/articles/${a.slug}`;
}
