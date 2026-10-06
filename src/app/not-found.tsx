import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Icon name="search" size={56} strokeWidth={2.5} className="mx-auto text-navy-soft" />
      <h1 className="mt-6 text-2xl font-bold">ページが見つかりませんでした</h1>
      <p className="mt-3 leading-relaxed text-navy-soft">
        記事が移動または削除された可能性があります。トップページの検索から目的の記事をお探しください。
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-brand-ink px-6 py-3 font-bold text-white hover:bg-navy">
        トップページへ戻る
      </Link>
    </div>
  );
}
