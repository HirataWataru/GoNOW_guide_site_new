import Link from "next/link";
import { Icon } from "@/components/icons";
import { Illustration, IllustrationTile } from "@/components/illustration";
import { SearchBox } from "@/components/search-box";
import { ArticleList, ContactBanner, SectionTitle } from "@/components/ui";
import { getAllArticles, getNews, getSearchItems } from "@/lib/content";
import { GUIDE_CATEGORIES, RESOURCE_CATEGORIES } from "@/lib/content/taxonomy";

const POPULAR_WORDS = ["しきい値", "タンクタイプ", "グラフ", "顧客 削除", "アタッチメント", "電波"];

export default async function Home() {
  const [all, news, searchItems] = await Promise.all([getAllArticles(), getNews(3), getSearchItems()]);
  const pinned = all.filter((a) => a.kind === "faq" && a.pinned).slice(0, 6);
  const steps = GUIDE_CATEGORIES.filter((c) => c.step !== null);
  const running = GUIDE_CATEGORIES.filter((c) => c.step === null);
  const countIn = (key: string) => all.filter((a) => (a.kind === "guide" || a.kind === "faq") && a.category === key).length;

  return (
    <>
      {/* 検索 */}
      <section className="bg-brand-gradient relative overflow-hidden text-white">
        <WatermarkRing />
        <div className="relative mx-auto max-w-3xl px-4 pt-14 pb-16 text-center sm:pt-20 sm:pb-20">
          <h1 className="text-3xl leading-tight font-bold [text-shadow:0_1px_2px_rgb(20_50_90/0.35)] sm:text-4xl">
            GoNOW ご利用ガイド
          </h1>
          <p className="mt-4 text-base text-white sm:text-lg">導入準備から日々の運用、困ったときの対処まで。</p>
          <div className="mt-8">
            <SearchBox items={searchItems} size="lg" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="font-bold text-white">よく検索されるキーワード：</span>
            {POPULAR_WORDS.map((w) => (
              <Link
                key={w}
                href={`/search?q=${encodeURIComponent(w)}`}
                className="rounded-full bg-white px-3 py-1 font-bold text-brand-ink hover:bg-navy hover:text-white"
              >
                {w}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 pt-14">
        {/* 導入ステップ */}
        <section aria-labelledby="steps-title">
          <SectionTitle id="steps-title">これから導入される方</SectionTitle>
          <p className="mt-2 text-sm text-navy-soft">ご契約から運用開始まで、4つのステップで進めます。今のステップを選んでください。</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {steps.map((c, i) => (
              <li key={c.key} className={i > 0 ? "lg:-ml-4" : ""}>
                <Link
                  href={`/guide/${c.key}`}
                  style={{ "--chevron": chevron(i === 0, i === steps.length - 1) } as React.CSSProperties}
                  className={`group relative flex h-full flex-col bg-brand-ink px-6 pt-5 pb-6 text-white transition-colors hover:bg-accent-ink focus-visible:bg-accent-ink max-lg:rounded-xl lg:pr-10 lg:[clip-path:var(--chevron)] ${
                    i > 0 ? "lg:pl-12" : ""
                  }`}
                >
                  <span className="text-xs font-bold tracking-widest">STEP</span>
                  <span className="text-3xl leading-none font-bold">{String(c.step).padStart(2, "0")}</span>
                  <IllustrationTile name={c.illustration} size={44} className="mt-4 self-start max-sm:hidden" />
                  <span className="mt-3 text-lg font-bold">{c.label}</span>
                  <span className="mt-1 text-sm leading-relaxed text-white">{c.description}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 運用中 */}
        <section aria-labelledby="running-title">
          <SectionTitle id="running-title">ご利用中の方</SectionTitle>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {running.map((c) => (
              <Link
                key={c.key}
                href={`/guide/${c.key}`}
                className="group flex items-center gap-5 rounded-2xl border-2 border-mist bg-white p-6 hover:border-brand-ink hover:bg-cloud"
              >
                <span className="rounded-2xl bg-cloud p-3 group-hover:bg-white">
                  <Illustration name={c.illustration} size={56} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold group-hover:text-brand-ink">{c.label}</span>
                  <span className="mt-1 block text-sm text-navy-soft">{c.description}</span>
                  <span className="mt-2 block text-xs font-bold text-navy-soft">{countIn(c.key)}件の記事</span>
                </span>
                <Icon name="arrowRight" size={20} className="shrink-0 text-navy-soft group-hover:text-brand-ink" />
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* よく見られている質問 */}
          <section aria-labelledby="faq-title">
            <div className="flex items-end justify-between gap-4">
              <SectionTitle id="faq-title">よく見られている質問</SectionTitle>
              <Link href="/faq" className="text-sm font-bold whitespace-nowrap text-brand-ink hover:underline">
                すべての質問 →
              </Link>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-2">
              <ArticleList items={pinned} />
            </div>
          </section>

          {/* お知らせ */}
          <section aria-labelledby="news-title">
            <div className="flex items-end justify-between gap-4">
              <SectionTitle id="news-title">お知らせ・TIPS</SectionTitle>
              <Link href="/news" className="text-sm font-bold whitespace-nowrap text-brand-ink hover:underline">
                一覧へ →
              </Link>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-2">
              <ArticleList items={news} showKind showDate />
            </div>
          </section>
        </div>

        {/* 資料・フォーム */}
        <section aria-labelledby="resources-title">
          <SectionTitle id="resources-title">資料・フォーム</SectionTitle>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {RESOURCE_CATEGORIES.filter((c) => all.some((a) => a.kind === "resource" && a.category === c.key)).map((c) => (
              <li key={c.key}>
                <Link
                  href={`/resources#${c.key}`}
                  className="flex h-full flex-col items-center gap-3 rounded-2xl border-2 border-mist px-3 py-5 text-center font-bold hover:border-brand-ink hover:bg-cloud hover:text-brand-ink"
                >
                  <Illustration name={c.illustration} size={48} />
                  <span className="text-sm">{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ContactBanner />
      </div>
    </>
  );
}

/** Canva の STEP 図と同じ矢羽根形。先頭は左端が平ら、末尾は右端が平ら */
function chevron(first: boolean, last: boolean) {
  const tip = 24;
  const right = last ? "100% 0, 100% 100%" : `calc(100% - ${tip}px) 0, 100% 50%, calc(100% - ${tip}px) 100%`;
  const left = first ? "0 100%" : `0 100%, ${tip}px 50%`;
  return `polygon(0 0, ${right}, ${left})`;
}

/** Canva サムネイルの背景にある透かしリングを再現 */
function WatermarkRing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute -top-24 -left-24 size-96 text-white/10">
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="24" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="12" />
    </svg>
  );
}
