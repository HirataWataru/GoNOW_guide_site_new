import "server-only";
import { Client, collectPaginatedAPI, isFullBlock, isFullPage } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";
import type { ArticleMeta, Block, ListItem, Rich } from "./types";
import { categoryKeyFromLabel, kindFromLabel } from "./taxonomy";

// Notion の記事データベース（データソース）のプロパティ名。
// データベース側の列名を変えたらここも合わせる。
export const PROP = {
  title: "タイトル",
  kind: "種別",
  category: "カテゴリ",
  slug: "スラッグ",
  summary: "概要",
  keywords: "キーワード",
  externalUrl: "外部リンク",
  published: "公開",
  publishedAt: "公開日",
  order: "並び順",
  pinned: "よく見られている",
} as const;

let client: Client | null = null;
function notion() {
  client ??= new Client({ auth: process.env.NOTION_TOKEN });
  return client;
}

export function isNotionConfigured() {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATA_SOURCE_ID);
}

// ───────── プロパティ ─────────

type Props = PageObjectResponse["properties"];

function plain(rich: RichTextItemResponse[]) {
  return rich.map((r) => r.plain_text).join("");
}

function propText(props: Props, name: string): string {
  const p = props[name];
  if (!p) return "";
  if (p.type === "title") return plain(p.title);
  if (p.type === "rich_text") return plain(p.rich_text);
  return "";
}

function propSelect(props: Props, name: string): string | undefined {
  const p = props[name];
  return p?.type === "select" ? (p.select?.name ?? undefined) : undefined;
}

function toMeta(page: PageObjectResponse): ArticleMeta | null {
  const props = page.properties;
  const kind = kindFromLabel(propSelect(props, PROP.kind));
  if (!kind) return null;

  const titleProp = Object.values(props).find((p) => p.type === "title");
  const keywords = props[PROP.keywords];
  const url = props[PROP.externalUrl];
  const date = props[PROP.publishedAt];
  const order = props[PROP.order];
  const pinned = props[PROP.pinned];

  return {
    id: page.id,
    slug: propText(props, PROP.slug) || page.id.replaceAll("-", ""),
    title: titleProp?.type === "title" ? plain(titleProp.title) : "",
    kind,
    category: categoryKeyFromLabel(propSelect(props, PROP.category)),
    summary: propText(props, PROP.summary),
    keywords: keywords?.type === "multi_select" ? keywords.multi_select.map((k) => k.name) : [],
    externalUrl: url?.type === "url" ? url.url : null,
    publishedAt: date?.type === "date" ? (date.date?.start ?? null) : null,
    updatedAt: page.last_edited_time,
    order: order?.type === "number" ? (order.number ?? 99) : 99,
    pinned: pinned?.type === "checkbox" ? pinned.checkbox : false,
  };
}

export async function fetchArticleMetas(): Promise<ArticleMeta[]> {
  const pages = await collectPaginatedAPI(notion().dataSources.query, {
    data_source_id: process.env.NOTION_DATA_SOURCE_ID!,
    filter: { property: PROP.published, checkbox: { equals: true } },
  });
  return pages
    .filter(isFullPage)
    .map(toMeta)
    .filter((m): m is ArticleMeta => m !== null && m.title !== "");
}

// ───────── 本文ブロック ─────────

const COLOR_MAP: Record<string, Rich["color"]> = {
  red: "red",
  orange: "orange",
  yellow: "orange",
  green: "green",
  blue: "blue",
  gray: "gray",
};

function toRich(items: RichTextItemResponse[]): Rich[] {
  return items.map((r) => {
    const a = r.annotations;
    const color = COLOR_MAP[a.color.replace("_background", "")];
    let href = r.href ?? undefined;
    // Notion 内リンク（/xxxx）はサイト内の記事 URL に読み替えられないので外す
    if (href?.startsWith("/")) href = undefined;
    return {
      text: r.plain_text,
      bold: a.bold || undefined,
      italic: a.italic || undefined,
      underline: a.underline || undefined,
      strike: a.strikethrough || undefined,
      code: a.code || undefined,
      color,
      href,
    };
  });
}

// Notion の署名付きファイル URL は1時間で切れるため、ブロック ID 経由の中継ルートで都度取り直す
const fileSrc = (blockId: string) => `/api/notion-file/${blockId}`;

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

type Node = BlockObjectResponse & { children?: Node[] };

async function fetchTree(blockId: string, depth = 0): Promise<Node[]> {
  const blocks = (await collectPaginatedAPI(notion().blocks.children.list, { block_id: blockId })).filter(
    isFullBlock,
  );
  return Promise.all(
    blocks.map(async (b) => {
      // 子ページ・子データベースの中身までは辿らない
      const descend = b.has_children && depth < 4 && b.type !== "child_page" && b.type !== "child_database";
      return descend ? { ...b, children: await fetchTree(b.id, depth + 1) } : b;
    }),
  );
}

function convert(nodes: Node[]): Block[] {
  const out: Block[] = [];
  for (const n of nodes) {
    const kids = () => convert(n.children ?? []);
    switch (n.type) {
      case "paragraph": {
        const text = toRich(n.paragraph.rich_text);
        if (text.length) out.push({ type: "p", text });
        out.push(...kids());
        break;
      }
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        const h = n.type === "heading_1" ? n.heading_1 : n.type === "heading_2" ? n.heading_2 : n.heading_3;
        out.push({ type: n.type === "heading_3" ? "h3" : "h2", id: `h-${n.id.slice(0, 8)}`, text: toRich(h.rich_text) });
        if (h.is_toggleable) out.push(...kids());
        break;
      }
      case "bulleted_list_item":
      case "numbered_list_item":
      case "to_do": {
        const listType = n.type === "numbered_list_item" ? "ol" : "ul";
        const rich =
          n.type === "bulleted_list_item"
            ? n.bulleted_list_item.rich_text
            : n.type === "numbered_list_item"
              ? n.numbered_list_item.rich_text
              : n.to_do.rich_text;
        const item: ListItem = { text: toRich(rich), children: n.children ? kids() : undefined };
        const last = out.at(-1);
        // 連続するリスト項目は1つのリストにまとめる
        if (last?.type === listType) last.items.push(item);
        else out.push({ type: listType, items: [item] });
        break;
      }
      case "callout": {
        const c = n.callout.color.replace("_background", "");
        const tone = c === "orange" || c === "red" || c === "yellow" ? "warn" : c === "green" ? "tip" : "info";
        const body: Block[] = [];
        const text = toRich(n.callout.rich_text);
        if (text.length) body.push({ type: "p", text });
        out.push({ type: "callout", tone, children: [...body, ...kids()] });
        break;
      }
      case "toggle":
        out.push({ type: "toggle", summary: toRich(n.toggle.rich_text), children: kids() });
        break;
      case "quote":
        out.push({ type: "quote", text: toRich(n.quote.rich_text) });
        break;
      case "code":
        out.push({ type: "code", text: n.code.rich_text.map((r) => r.plain_text).join("") });
        break;
      case "divider":
        out.push({ type: "divider" });
        break;
      case "image": {
        const caption = toRich(n.image.caption);
        out.push({
          type: "image",
          src: n.image.type === "external" ? n.image.external.url : fileSrc(n.id),
          alt: caption.map((c) => c.text).join("") || "操作画面のスクリーンショット",
          caption: caption.length ? caption : undefined,
        });
        break;
      }
      case "video": {
        if (n.video.type === "external") {
          const yt = youtubeEmbed(n.video.external.url);
          if (yt) out.push({ type: "video", src: yt, provider: "youtube" });
          else out.push({ type: "link", href: n.video.external.url, title: "動画を見る" });
        } else {
          out.push({ type: "video", src: fileSrc(n.id), provider: "file" });
        }
        break;
      }
      case "file":
      case "pdf": {
        const f = n.type === "file" ? n.file : n.pdf;
        const name = "name" in f && typeof f.name === "string" && f.name ? f.name : "ファイル";
        out.push({ type: "file", href: f.type === "external" ? f.external.url : fileSrc(n.id), name });
        break;
      }
      case "bookmark":
        out.push({ type: "link", href: n.bookmark.url, title: plain(n.bookmark.caption) || n.bookmark.url });
        break;
      case "embed": {
        const yt = youtubeEmbed(n.embed.url);
        if (yt) out.push({ type: "video", src: yt, provider: "youtube" });
        else out.push({ type: "link", href: n.embed.url, title: n.embed.url });
        break;
      }
      case "table": {
        const rows = (n.children ?? [])
          .filter((r) => r.type === "table_row")
          .map((r) => (r.type === "table_row" ? r.table_row.cells.map(toRich) : []));
        out.push({ type: "table", header: n.table.has_column_header, rows });
        break;
      }
      case "column_list":
        out.push({ type: "columns", columns: (n.children ?? []).map((col) => convert(col.children ?? [])) });
        break;
      case "synced_block":
        out.push(...kids());
        break;
      default:
        // 未対応のブロック（子ページ・データベース等）は表示しない
        break;
    }
  }
  return out;
}

export async function fetchArticleBlocks(pageId: string): Promise<Block[]> {
  return convert(await fetchTree(pageId));
}

/** ブロックの親をたどって、それが載っているページの ID を返す */
async function findOwnerPage(blockId: string): Promise<string | null> {
  let id = blockId;
  for (let i = 0; i < 8; i++) {
    const b = await notion().blocks.retrieve({ block_id: id });
    if (!isFullBlock(b)) return null;
    if (b.parent.type === "page_id") return b.parent.page_id;
    if (b.parent.type !== "block_id") return null;
    id = b.parent.block_id;
  }
  return null;
}

/**
 * 画像・動画・ファイルの最新 URL を返す。
 * 公開中の記事に含まれるブロックでなければ null（非公開記事のファイルを ID 指定で取られないように）。
 */
export async function fetchFreshFileUrl(blockId: string, publishedPageIds: Set<string>): Promise<string | null> {
  const owner = await findOwnerPage(blockId);
  if (!owner || !publishedPageIds.has(owner)) return null;
  const b = await notion().blocks.retrieve({ block_id: blockId });
  if (!isFullBlock(b)) return null;
  const f =
    b.type === "image" ? b.image : b.type === "video" ? b.video : b.type === "file" ? b.file : b.type === "pdf" ? b.pdf : null;
  if (!f) return null;
  return f.type === "file" ? f.file.url : f.type === "external" ? f.external.url : null;
}

