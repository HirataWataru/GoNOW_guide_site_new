import Link from "next/link";
import { Icon, type IconName } from "./icons";
import { Illustration, IllustrationTile, type IllustrationName } from "./illustration";
import { KINDS } from "@/lib/content/taxonomy";
import { articleHref, isExternalLink } from "@/lib/content/search";
import type { ArticleMeta } from "@/lib/content/types";

export type Crumb = { href?: string; label: string };

// サーバーのタイムゾーンに関係なく日本時間で表示する
const dateFormat = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric" });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="現在地" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-white/90">
        <li>
          <Link href="/" className="hover:underline">
            トップ
          </Link>
        </li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <span aria-hidden="true">›</span>
            {c.href ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Canva のサムネイル（青グラデーション＋白タイトル）を踏襲したページ見出し */
export function PageHero({
  title,
  lead,
  crumbs,
  illustration,
  children,
}: {
  title: string;
  lead?: string;
  crumbs: Crumb[];
  illustration?: IllustrationName;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-brand-gradient relative overflow-hidden text-white">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-10">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 flex items-center gap-4">
          {illustration && <IllustrationTile name={illustration} size={44} className="max-sm:hidden" />}
          <h1 className="text-2xl leading-snug font-bold [text-shadow:0_1px_2px_rgb(20_50_90/0.35)] sm:text-3xl">
            {title}
          </h1>
        </div>
        {lead && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-white">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

export function KindBadge({ kind }: { kind: ArticleMeta["kind"] }) {
  const tone =
    kind === "news" ? "bg-accent-soft text-accent-ink" : kind === "faq" ? "bg-cloud text-brand-ink" : "bg-mist text-navy";
  return <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${tone}`}>{KINDS[kind].label}</span>;
}

/** 記事への1行リンク。外部資料は新しいタブで開くことを明示する */
export function ArticleLink({ article, showKind = false, showDate = false }: { article: ArticleMeta; showKind?: boolean; showDate?: boolean }) {
  const external = isExternalLink(article);
  const href = articleHref(article);
  // /files/ 以下は Word・Excel などのダウンロード
  const download = href.startsWith("/files/");
  const date = article.publishedAt ?? article.updatedAt;
  const Anchor = download ? "a" : Link;
  return (
    <Anchor
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(download ? { download: true } : {})}
      className="group flex items-start gap-3 rounded-lg px-3 py-3.5 hover:bg-cloud"
    >
      {showKind && <KindBadge kind={article.kind} />}
      <span className="min-w-0 flex-1">
        {showDate && <time dateTime={date} className="block text-xs text-navy-soft">{formatDate(date)}</time>}
        <span className="font-bold text-navy group-hover:text-brand-ink group-hover:underline">{article.title}</span>
        {article.summary && <span className="mt-1 block text-sm leading-relaxed text-navy-soft">{article.summary}</span>}
      </span>
      <Icon
        name={download ? "download" : external ? "external" : "arrowRight"}
        size={16}
        className="mt-1 shrink-0 text-navy-soft group-hover:text-brand-ink"
      />
      {external && <span className="sr-only">（新しいタブで開きます）</span>}
      {download && <span className="sr-only">（ファイルをダウンロードします）</span>}
    </Anchor>
  );
}

export function ArticleList({ items, showKind, showDate }: { items: ArticleMeta[]; showKind?: boolean; showDate?: boolean }) {
  if (!items.length) return <p className="px-3 py-6 text-sm text-navy-soft">まだ記事がありません。</p>;
  return (
    <ul className="divide-y divide-line">
      {items.map((a) => (
        <li key={a.id}>
          <ArticleLink article={a} showKind={showKind} showDate={showDate} />
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ children, icon, id }: { children: React.ReactNode; icon?: IconName; id?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-xl font-bold text-navy">
      {icon ? <Icon name={icon} size={26} className="text-brand-ink" /> : <span aria-hidden="true" className="size-3.5 rounded-full bg-navy" />}
      {children}
    </h2>
  );
}

export function ContactBanner() {
  return (
    <aside aria-labelledby="contact-title" className="rounded-2xl border-2 border-mist bg-cloud p-6 sm:flex sm:items-center sm:gap-6">
      <Illustration name="operator" size={64} className="shrink-0 max-sm:hidden" />
      <div>
        <h2 id="contact-title" className="text-lg font-bold">
          解決しない場合はお問い合わせください
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-navy-soft">
          GoNOW 画面右下のチャットボット、または担当者までご連絡ください。
          画面の
          <Link href="/articles/how-to-screenshot" className="mx-0.5 font-bold text-brand-ink underline underline-offset-2">
            スクリーンショット
          </Link>
          を添えていただくと、スムーズにご案内できます。
        </p>
      </div>
    </aside>
  );
}
