import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Lexer, Marked, type Token, type TokenizerAndRendererExtension, type Tokens } from "marked";
import { parse as parseYaml } from "yaml";
import type { Article, ArticleKind, Block, ListItem, Rich } from "./types";
import { GUIDE_CATEGORIES, RESOURCE_CATEGORIES, categoryKeyFromLabel } from "./taxonomy";

// content/<種別フォルダ>/<スラッグ>.md を記事として読み込む。
// 書き方は content/README.md を参照。frontmatter の項目名は Notion の記事データベースの列名と同じ。

export const CONTENT_DIR = path.join(process.cwd(), "content");

const FOLDERS: Record<string, ArticleKind> = {
  guide: "guide",
  faq: "faq",
  news: "news",
  tips: "tips",
  resources: "resource",
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`content/${file}: ${message}`);
  }
}

// ───────── 本文（Markdown → Block） ─────────

// 標準の Markdown では「**【データ入出力】**から」「**50％**を」のように記号と文字に挟まれた太字が効かない。
// 日本語では頻出なので、** で囲んだ部分は記号の位置に関係なく太字にする。
const cjkStrong: TokenizerAndRendererExtension = {
  name: "cjkStrong",
  level: "inline",
  start: (src) => src.indexOf("**"),
  tokenizer(src) {
    const m = /^\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*/.exec(src);
    if (!m) return undefined;
    return { type: "strong", raw: m[0], text: m[1], tokens: this.lexer.inlineTokens(m[1]) };
  },
  renderer: () => "",
};

const md = new Marked({ gfm: true });
md.use({ extensions: [cjkStrong] });
const lexBlocks = (src: string) => md.lexer(src);
const lexInline = (src: string) => Lexer.lexInline(src, md.defaults);

function inline(tokens: Token[] | undefined, style: Omit<Rich, "text"> = {}): Rich[] {
  const out: Rich[] = [];
  for (const t of tokens ?? []) {
    switch (t.type) {
      case "strong":
        out.push(...inline((t as Tokens.Strong).tokens, { ...style, bold: true }));
        break;
      case "em":
        out.push(...inline((t as Tokens.Em).tokens, { ...style, italic: true }));
        break;
      case "del":
        out.push(...inline((t as Tokens.Del).tokens, { ...style, strike: true }));
        break;
      case "codespan":
        out.push({ text: (t as Tokens.Codespan).text, ...style, code: true });
        break;
      case "link":
        out.push(...inline((t as Tokens.Link).tokens, { ...style, href: (t as Tokens.Link).href }));
        break;
      case "br":
        out.push({ text: "\n", ...style });
        break;
      case "text": {
        const tt = t as Tokens.Text;
        if (tt.tokens?.length) out.push(...inline(tt.tokens, style));
        else out.push({ text: decode(tt.text), ...style });
        break;
      }
      case "escape":
        out.push({ text: (t as Tokens.Escape).text, ...style });
        break;
      case "html":
        // <br> 以外のインライン HTML は表示しない
        if (/^<br\s*\/?>$/i.test(t.raw.trim())) out.push({ text: "\n", ...style });
        break;
      case "image": {
        const img = t as Tokens.Image;
        out.push({ text: "", image: { src: img.href, alt: img.text }, ...style });
        break;
      }
      default:
        if ("text" in t && typeof t.text === "string") out.push({ text: t.text, ...style });
    }
  }
  return out;
}

function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const ALERTS: Record<string, "info" | "warn" | "tip"> = {
  NOTE: "info",
  IMPORTANT: "info",
  WARNING: "warn",
  CAUTION: "warn",
  TIP: "tip",
};

type Ctx = { usedIds: Map<string, number> };

/** GitHub と同じ規則で見出しの ID を作る（[リンク](#見出しの文字) が GitHub 上でもサイトでも同じように動く） */
function headingId(text: string, ctx: Ctx) {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-") || "section";
  const n = ctx.usedIds.get(base) ?? 0;
  ctx.usedIds.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

/** 改行ごとに分ける */
function splitLines(rich: Rich[]): Rich[][] {
  const lines: Rich[][] = [[]];
  for (const r of rich) {
    const parts = r.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part || r.image) lines.at(-1)!.push({ ...r, text: part });
    });
  }
  return lines.filter((l) => l.length > 0);
}

const NOTE_MARK = /^\s*[※＊]\s*/;

/**
 * 段落のうち「※」で始まる行を、本文と分けて小さな補足として表示する。
 * 例：「リストをご用意ください。\n※電波判定は当社で行います。」→ 本文＋補足1行
 */
function paragraphWithNotes(rich: Rich[]): Block[] {
  const lines = splitLines(rich);
  const isNote = (line: Rich[]) => NOTE_MARK.test(line[0]?.text ?? "");
  if (!lines.some(isNote)) return [{ type: "p", text: rich }];

  const out: Block[] = [];
  for (const line of lines) {
    if (isNote(line)) {
      const stripped = [{ ...line[0], text: line[0].text.replace(NOTE_MARK, "") }, ...line.slice(1)];
      const last = out.at(-1);
      if (last?.type === "notes") last.items.push(stripped);
      else out.push({ type: "notes", items: [stripped] });
    } else {
      const last = out.at(-1);
      if (last?.type === "p") last.text.push({ text: "\n" }, ...line);
      else out.push({ type: "p", text: [...line] });
    }
  }
  return out;
}

function convert(tokens: Token[], ctx: Ctx): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    switch (t.type) {
      case "space":
        break;
      case "heading": {
        const h = t as Tokens.Heading;
        const text = inline(h.tokens);
        out.push({ type: h.depth <= 2 ? "h2" : "h3", id: headingId(text.map((r) => r.text).join(""), ctx), text });
        break;
      }
      case "paragraph": {
        const p = t as Tokens.Paragraph;
        const meaningful = p.tokens.filter((x) => !(x.type === "text" && x.raw.trim() === ""));
        const only = meaningful.length === 1 ? meaningful[0] : null;
        // 画像だけが複数並んだ段落 → 横並びの画像
        if (meaningful.length > 1 && meaningful.every((x) => x.type === "image" || x.type === "br")) {
          const imgs = meaningful.filter((x): x is Tokens.Image => x.type === "image");
          out.push({
            type: "columns",
            columns: imgs.map((img) => [
              { type: "image", src: img.href, alt: img.text || "画像", caption: img.title ? [{ text: img.title }] : undefined },
            ]),
          });
          break;
        }
        // 画像だけの段落 → 画像
        if (only?.type === "image") {
          const img = only as Tokens.Image;
          out.push({ type: "image", src: img.href, alt: img.text || "画像", caption: img.title ? [{ text: img.title }] : undefined });
          break;
        }
        // リンクだけの段落 → YouTube は埋め込み、それ以外はリンクカード
        if (only?.type === "link") {
          const link = only as Tokens.Link;
          const yt = youtubeEmbed(link.href);
          if (yt) out.push({ type: "video", src: yt, provider: "youtube" });
          else out.push({ type: "link", href: link.href, title: link.text || link.href });
          break;
        }
        out.push(...paragraphWithNotes(inline(p.tokens)));
        break;
      }
      case "list": {
        const l = t as Tokens.List;
        const items: ListItem[] = l.items.map((item) => {
          const [first, ...rest] = item.tokens;
          const text = first && (first.type === "text" || first.type === "paragraph") ? inline((first as Tokens.Text).tokens ?? [first]) : [];
          const children = convert(first && text.length ? rest : item.tokens, ctx);
          return { text, children: children.length ? children : undefined };
        });
        out.push({ type: l.ordered ? "ol" : "ul", items });
        break;
      }
      case "blockquote": {
        const q = t as Tokens.Blockquote;
        const m = q.text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/);
        if (m) {
          out.push({ type: "callout", tone: ALERTS[m[1]], children: convert(lexBlocks(q.text.slice(m[0].length)), ctx) });
        } else {
          out.push({ type: "quote", text: q.tokens.flatMap((x) => inline((x as Tokens.Paragraph).tokens ?? [x])) });
        }
        break;
      }
      case "table": {
        const tb = t as Tokens.Table;
        const row = (cells: Tokens.TableCell[]) => cells.map((c) => inline(c.tokens));
        out.push({ type: "table", header: true, rows: [row(tb.header), ...tb.rows.map(row)] });
        break;
      }
      case "hr":
        out.push({ type: "divider" });
        break;
      case "code":
        out.push({ type: "code", text: (t as Tokens.Code).text });
        break;
      case "html": {
        // <details><summary>見出し</summary> … </details> → 折りたたみ
        const open = t.raw.match(/^\s*<details[^>]*>\s*(?:<summary>([\s\S]*?)<\/summary>)?/i);
        if (open) {
          let depth = 1;
          let j = i + 1;
          for (; j < tokens.length; j++) {
            if (tokens[j].type !== "html") continue;
            if (/<details/i.test(tokens[j].raw)) depth++;
            if (/<\/details>/i.test(tokens[j].raw) && --depth === 0) break;
          }
          const summary = open[1] ? inline(lexInline(open[1].trim())) : [{ text: "詳しく見る" }];
          out.push({ type: "toggle", summary, children: convert(tokens.slice(i + 1, j), ctx) });
          i = j;
        }
        // それ以外の HTML ブロックは表示しない
        break;
      }
    }
  }
  return out;
}

export function markdownToBlocks(source: string): Block[] {
  return convert(lexBlocks(source), { usedIds: new Map() });
}

// ───────── frontmatter ─────────

type Front = {
  タイトル?: string;
  カテゴリ?: string;
  概要?: string;
  キーワード?: string[] | string;
  外部リンク?: string;
  公開?: boolean;
  公開日?: string | Date;
  更新日?: string | Date;
  並び順?: number;
  よく見られている?: boolean;
};

function splitFrontmatter(src: string, file: string): { front: Front; body: string } {
  const m = src.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new ContentError(file, "先頭に --- で囲んだ設定（frontmatter）がありません");
  try {
    return { front: (parseYaml(m[1]) ?? {}) as Front, body: m[2] };
  } catch (e) {
    throw new ContentError(file, `設定（frontmatter）の書き方が正しくありません：${(e as Error).message}`);
  }
}

function toDate(v: string | Date | undefined, file: string, key: string): string | null {
  if (v === undefined || v === null || v === "") return null;
  const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ContentError(file, `${key} は 2026-10-06 の形で書いてください（今は「${s}」）`);
  return s;
}

function parseFile(folder: string, filename: string): Article | null {
  const file = `${folder}/${filename}`;
  const kind = FOLDERS[folder];
  const slug = filename.replace(/\.md$/, "");
  if (!SLUG.test(slug)) throw new ContentError(file, "ファイル名は半角の英小文字・数字・ハイフンにしてください（例：tank-type.md）");

  const { front, body } = splitFrontmatter(fs.readFileSync(path.join(CONTENT_DIR, folder, filename), "utf8"), file);
  if (front.公開 === false) return null;

  const title = front.タイトル?.toString().trim();
  if (!title) throw new ContentError(file, "タイトル がありません");

  let category: string | null = null;
  if (kind === "guide" || kind === "faq" || kind === "resource") {
    const choices = kind === "resource" ? RESOURCE_CATEGORIES : GUIDE_CATEGORIES;
    category = categoryKeyFromLabel(front.カテゴリ);
    if (!category || !choices.some((c) => c.key === category)) {
      throw new ContentError(file, `カテゴリ は次のどれかにしてください：${choices.map((c) => c.label).join(" / ")}（今は「${front.カテゴリ ?? ""}」）`);
    }
  }

  const updatedAt = toDate(front.更新日, file, "更新日");
  if (!updatedAt) throw new ContentError(file, "更新日 がありません（例：更新日: 2026-10-06）");
  const publishedAt = toDate(front.公開日, file, "公開日");
  if ((kind === "news" || kind === "tips") && !publishedAt) throw new ContentError(file, "お知らせ・TIPS には 公開日 が必要です");

  const externalUrl = front.外部リンク?.toString().trim() || null;
  if (externalUrl && !/^(https?:\/\/|\/)/.test(externalUrl)) {
    throw new ContentError(file, "外部リンク は https:// から始まる URL か、/articles/〜 のようなサイト内のパスにしてください");
  }

  const keywords = Array.isArray(front.キーワード)
    ? front.キーワード.map(String)
    : typeof front.キーワード === "string"
      ? front.キーワード.split(/[、,]\s*/)
      : [];

  return {
    id: `${folder}/${slug}`,
    slug,
    title,
    kind,
    category,
    summary: front.概要?.toString().trim() ?? "",
    keywords: keywords.map((k) => k.trim()).filter(Boolean),
    externalUrl,
    publishedAt,
    updatedAt,
    order: typeof front.並び順 === "number" ? front.並び順 : 99,
    pinned: front.よく見られている === true,
    blocks: externalUrl ? [] : markdownToBlocks(body),
  };
}

/** content/ 以下の記事をすべて読み込む。書き方の誤りはファイル名つきのエラーにする */
export function loadMarkdownArticles(): Article[] {
  const articles: Article[] = [];
  for (const folder of Object.keys(FOLDERS)) {
    const dir = path.join(CONTENT_DIR, folder);
    if (!fs.existsSync(dir)) continue;
    for (const filename of fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"))) {
      const a = parseFile(folder, filename);
      if (a) articles.push(a);
    }
  }
  const seen = new Map<string, string>();
  for (const a of articles) {
    const other = seen.get(a.slug);
    if (other) throw new ContentError(`${a.id}.md`, `ファイル名が content/${other}.md と重複しています（フォルダが違っても同じ名前は使えません）`);
    seen.set(a.slug, a.id);
  }
  return articles;
}
