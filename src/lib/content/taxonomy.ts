import type { ArticleKind } from "./types";
import type { IllustrationName } from "@/components/illustration";

// Notion の「種別」「カテゴリ」セレクトの選択肢名と、サイト内の URL キーの対応表。
// Notion 側で選択肢名を変えたときは label を合わせる。

export const KINDS: Record<ArticleKind, { label: string; path: string }> = {
  guide: { label: "ガイド", path: "/guide" },
  faq: { label: "よくある質問", path: "/faq" },
  news: { label: "お知らせ", path: "/news" },
  tips: { label: "TIPS", path: "/news" },
  resource: { label: "資料・フォーム", path: "/resources" },
};

export type Category = {
  key: string;
  label: string;
  /** トップの導入ステップに並べる順番。null はステップ外 */
  step: number | null;
  description: string;
  illustration: IllustrationName;
};

// ガイド・FAQ で使うカテゴリ。導入の流れ（Canva の STEP 図）に沿って並べる。
export const GUIDE_CATEGORIES: Category[] = [
  { key: "contract", label: "ご契約", step: 1, description: "お申し込みから契約締結までの流れ", illustration: "contract" },
  { key: "sensor", label: "センサー設置", step: 2, description: "センサー・アタッチメントの準備と取り付け", illustration: "tank-sensor" },
  { key: "setup", label: "GoNOW初期設定", step: 3, description: "初期設定・顧客とタンクの登録", illustration: "laptop-cloud" },
  { key: "training", label: "操作トレーニング", step: 4, description: "配送計画など基本操作の習得", illustration: "training" },
  { key: "operation", label: "日々の運用", step: null, description: "配送計画・しきい値・データ入出力", illustration: "tanker-truck" },
  { key: "trouble", label: "困ったとき", step: null, description: "グラフの異常・通信トラブルの対処", illustration: "operator" },
];

export const RESOURCE_CATEGORIES: Category[] = [
  { key: "forms", label: "ご注文・申請フォーム", step: null, description: "", illustration: "checklist" },
  { key: "documents", label: "書類・テンプレート", step: null, description: "", illustration: "folder-docs" },
  { key: "subsidy", label: "補助金", step: null, description: "", illustration: "cost" },
  { key: "materials", label: "提供素材", step: null, description: "", illustration: "gonow-tablet" },
  { key: "terms", label: "規約・約款", step: null, description: "", illustration: "shield" },
];

const ALL_CATEGORIES = [...GUIDE_CATEGORIES, ...RESOURCE_CATEGORIES];

export function findCategory(key: string | null): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.key === key);
}

export function categoryKeyFromLabel(label: string | undefined): string | null {
  if (!label) return null;
  return ALL_CATEGORIES.find((c) => c.label === label)?.key ?? null;
}

export function kindFromLabel(label: string | undefined): ArticleKind | null {
  const entry = Object.entries(KINDS).find(([, v]) => v.label === label);
  return (entry?.[0] as ArticleKind | undefined) ?? null;
}
