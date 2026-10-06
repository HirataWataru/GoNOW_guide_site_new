import Link from "next/link";
import { Logo } from "./site-header";

const LINKS = [
  { href: "https://noon-fiction-0ac.notion.site/188cf60aef3c48c3b1fc6f4b7c77d2c7", label: "GoNOW 利用規約" },
  { href: "https://noon-fiction-0ac.notion.site/7b29183d00a64a5097acbeb4d868b645", label: "センサー売買約款" },
  { href: "https://noon-fiction-0ac.notion.site/25578864d72b80598d7dce566d83f228", label: "プライバシーポリシー" },
  { href: "https://www.zero-spec.com/", label: "コーポレートサイト" },
  { href: "https://www.youtube.com/channel/UCQlLV3rCIOapz0x8P-QNiPw", label: "YouTube" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-cloud">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_2fr]">
        <div>
          <Link href="/" aria-label="GoNOW ご利用ガイド トップ">
            <Logo />
          </Link>
          <p className="mt-3 text-sm text-navy-soft">株式会社ゼロスペック</p>
        </div>
        <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-navy hover:underline">
                {l.label}
                <span className="sr-only">（新しいタブで開きます）</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-navy-soft">© ZEROSPEC Inc.</p>
    </footer>
  );
}
