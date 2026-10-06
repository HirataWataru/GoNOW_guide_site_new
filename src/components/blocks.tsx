import { Icon } from "./icons";
import type { Block, Rich } from "@/lib/content/types";

const COLOR_CLASS: Record<NonNullable<Rich["color"]>, string> = {
  red: "text-[#c62828]",
  orange: "text-accent-ink",
  green: "text-[#2e7d32]",
  blue: "text-brand-ink",
  gray: "text-navy-soft",
};

export function RichText({ value }: { value: Rich[] }) {
  return (
    <>
      {value.map((r, i) => {
        const cls = [
          r.bold && "font-bold",
          r.italic && "italic",
          r.underline && "underline underline-offset-2",
          r.strike && "line-through",
          r.color && COLOR_CLASS[r.color],
        ]
          .filter(Boolean)
          .join(" ");
        if (r.image) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={i} src={r.image.src} alt={r.image.alt} loading="lazy" className="my-1 inline-block max-h-32 w-auto rounded border border-line bg-white align-middle" />;
        }
        const lines = r.text.split("\n");
        const text = lines.flatMap((l, j) => (j === 0 ? [l] : [<br key={j} />, l]));
        let node: React.ReactNode = r.code ? (
          <code className="rounded bg-cloud px-1.5 py-0.5 text-[0.9em]">{text}</code>
        ) : (
          text
        );
        if (cls) node = <span className={cls}>{node}</span>;
        if (r.href) {
          const external = /^https?:/.test(r.href);
          node = (
            <a href={r.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

const CALLOUT = {
  info: { box: "border-brand/40 bg-[#eef6fe]", icon: "tips", iconCls: "text-brand-ink", label: "ポイント" },
  warn: { box: "border-accent/60 bg-accent-soft", icon: "news", iconCls: "text-accent-ink", label: "ご注意" },
  tip: { box: "border-[#7cc48a] bg-[#eff8f1]", icon: "shield", iconCls: "text-[#2e7d32]", label: "補足" },
} as const;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "h2":
      return (
        <h2 id={b.id}>
          <RichText value={b.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 id={b.id}>
          <RichText value={b.text} />
        </h3>
      );
    case "p":
      return (
        <p>
          <RichText value={b.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const List = b.type;
      return (
        <List>
          {b.items.map((item, i) => (
            <li key={i}>
              <RichText value={item.text} />
              {item.children && (
                <div className="mt-2 space-y-2">
                  <Blocks blocks={item.children} />
                </div>
              )}
            </li>
          ))}
        </List>
      );
    }
    case "callout": {
      const c = CALLOUT[b.tone];
      return (
        <div role="note" aria-label={c.label} className={`flex gap-3 rounded-xl border-l-4 p-4 ${c.box}`}>
          <Icon name={c.icon} size={22} className={`mt-1 shrink-0 ${c.iconCls}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <Blocks blocks={b.children} />
          </div>
        </div>
      );
    }
    case "toggle":
      return (
        <details className="group rounded-xl border border-line bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold hover:bg-cloud [&::-webkit-details-marker]:hidden">
            <span>
              <RichText value={b.summary} />
            </span>
            <Icon name="chevronDown" size={18} className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-line px-5 py-5">
            <Blocks blocks={b.children} />
          </div>
        </details>
      );
    case "image":
      return (
        <figure>
          {/* Notion の画像はサイズ不明・URL が都度変わるため next/image ではなく img を使う */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} loading="lazy" className="w-full rounded-lg border border-line" />
          {b.caption && (
            <figcaption className="mt-2 text-center text-sm text-navy-soft">
              <RichText value={b.caption} />
            </figcaption>
          )}
        </figure>
      );
    case "video":
      return b.provider === "youtube" ? (
        <div className="aspect-video overflow-hidden rounded-lg border border-line">
          <iframe
            src={b.src}
            title="動画"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : (
        <video src={b.src} controls preload="metadata" className="w-full rounded-lg border border-line" />
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <tbody>
              {b.rows.map((row, ri) => {
                const isHead = b.header && ri === 0;
                return (
                  <tr key={ri} className={isHead ? "bg-brand-ink text-white" : "even:bg-cloud"}>
                    {row.map((cell, ci) => {
                      const Cell = isHead ? "th" : "td";
                      return (
                        <Cell key={ci} scope={isHead ? "col" : undefined} className="border-t border-line px-4 py-2.5 text-left align-top first:border-t-0">
                          <RichText value={cell} />
                        </Cell>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    case "columns":
      return (
        <div className="grid gap-6 md:grid-flow-col md:auto-cols-fr">
          {b.columns.map((col, i) => (
            <div key={i} className="space-y-4">
              <Blocks blocks={col} />
            </div>
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-mist pl-4 text-navy-soft">
          <RichText value={b.text} />
        </blockquote>
      );
    case "code":
      return <pre className="overflow-x-auto rounded-lg bg-navy p-4 text-sm text-white">{b.text}</pre>;
    case "link":
    case "file": {
      const external = /^https?:/.test(b.href);
      return (
        <a
          href={b.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex! items-center gap-3 rounded-xl border-2 border-mist px-4 py-3 font-bold text-navy! no-underline! hover:border-brand-ink hover:bg-cloud"
        >
          <Icon name={b.type === "file" ? "download" : "external"} size={20} className="shrink-0 text-brand-ink" />
          <span className="min-w-0 flex-1 break-all">{b.type === "file" ? b.name : b.title}</span>
          {external && <span className="sr-only">（新しいタブで開きます）</span>}
        </a>
      );
    }
    case "divider":
      return <hr className="border-line" />;
  }
}
