import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSearchItems } from "@/lib/content";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// 全ページを静的に生成し、5分ごとに Notion の内容で作り直す
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    default: "GoNOW ご利用ガイド",
    template: "%s｜GoNOW ご利用ガイド",
  },
  description: "GoNOW の導入準備から日々の運用、困ったときの対処まで。操作ガイド・よくある質問・お知らせをまとめています。",
  // 正式公開までは検索エンジンに載せない。公開時に環境変数 SITE_INDEXABLE=true を設定する
  robots: process.env.SITE_INDEXABLE === "true" ? undefined : { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // ヘッダーの検索候補用（タイトルとキーワードだけ渡す）
  const suggestions = await getSearchItems();

  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          本文へスキップ
        </a>
        <SiteHeader suggestions={suggestions} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
