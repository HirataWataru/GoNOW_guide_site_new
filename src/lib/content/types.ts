// 記事データの共通型。Notion とサンプルデータのどちらから読み込んでも、この形にそろえて描画する。

export type ArticleKind = "guide" | "faq" | "news" | "tips" | "resource";

export type Rich = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  color?: "red" | "orange" | "green" | "blue" | "gray";
  href?: string;
  /** 表のセルなど、文中に置く小さな画像 */
  image?: { src: string; alt: string };
};

export type ListItem = { text: Rich[]; children?: Block[] };

export type Block =
  | { type: "h2" | "h3"; id: string; text: Rich[] }
  | { type: "p"; text: Rich[] }
  | { type: "ul" | "ol"; items: ListItem[] }
  | { type: "callout"; tone: "info" | "warn" | "tip"; children: Block[] }
  | { type: "toggle"; summary: Rich[]; children: Block[] }
  | { type: "image"; src: string; alt: string; caption?: Rich[] }
  | { type: "video"; src: string; provider: "youtube" | "file" }
  | { type: "table"; header: boolean; rows: Rich[][][] }
  | { type: "columns"; columns: Block[][] }
  | { type: "quote"; text: Rich[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; title: string }
  | { type: "file"; href: string; name: string }
  | { type: "divider" };

export type ArticleMeta = {
  id: string;
  slug: string;
  title: string;
  kind: ArticleKind;
  category: string | null;
  summary: string;
  keywords: string[];
  /** リンクだけの記事（Canva 資料・フォーム等）は本文を持たず、ここに飛ばす */
  externalUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
  order: number;
  pinned: boolean;
};

export type Article = ArticleMeta & { blocks: Block[] };
