# GoNOW ご利用ガイド（お客様向けサイト）

GoNOW をご利用中のお客様向けの情報サイトです。旧「GoNOWご利用ガイド」と現行「お役立ち情報」（いずれも Notion）を1つにまとめ直したものです。

- 記事は **`content/` の Markdown ファイル**（GitHub で編集 → デプロイで反映）。書き方は [content/README.md](content/README.md)
- Notion の API トークンが用意できたら、Notion のデータベースから自動反映する方式に切り替える（実装済み。環境変数を設定すると Notion が優先される）

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 本番ビルド
npm run lint
```

## 画面構成

| URL | 内容 |
| --- | --- |
| `/` | 検索・導入ステップ（STEP01〜04）・ご利用中の方の入口・よく見られている質問・お知らせ |
| `/guide`、`/guide/[カテゴリ]` | カテゴリ別のガイドとよくある質問。導入ステップは前後のステップへ移動できる |
| `/faq` | よくある質問（カテゴリ別） |
| `/news` | お知らせ・TIPS（新しい順、種別で絞り込み） |
| `/resources` | 資料・フォーム・規約 |
| `/articles/[スラッグ]` | 記事本文。目次・最終更新日・関連記事つき |
| `/search?q=` | 検索結果（タイトル・キーワード・概要が対象。ひらがな／カタカナ、全角／半角を区別しない） |

## 記事の管理（現在：Markdown）

- `content/<種類>/<スラッグ>.md` が1記事。種類はフォルダで決まる（`guide` / `faq` / `news` / `tips` / `resources`）
- 先頭の frontmatter の項目名は、下記の Notion データベースの列名と同じ（移行時に対応がとりやすいように）
- 画像は `public/images/articles/` に置く
- 書き方の誤り（カテゴリ名・日付の形・ファイル名の重複など）はビルド時にファイル名つきのエラーになる。GitHub Actions（`.github/workflows/check.yml`）でも同じ確認をする
- 読み込み処理：`src/lib/content/markdown.ts`。GitHub の書き方（`> [!WARNING]` の注意書き、`<details>` の折りたたみ）に対応

## Notion の記事データベース（API トークン提供後に切り替え）

### 1. データベースを用意する

次の列（プロパティ）を持つデータベースを作ります。**列名は完全一致**が必要です（変える場合は `src/lib/content/notion.ts` の `PROP` も変更）。

| 列名 | 種類 | 内容 |
| --- | --- | --- |
| タイトル | タイトル | 記事タイトル。FAQ は「〜が知りたい」など質問の形で |
| 種別 | セレクト | `ガイド` / `よくある質問` / `お知らせ` / `TIPS` / `資料・フォーム` |
| カテゴリ | セレクト | ガイド・FAQ：`ご契約` / `センサー設置` / `GoNOW初期設定` / `操作トレーニング` / `日々の運用` / `困ったとき`<br>資料・フォーム：`ご注文・申請フォーム` / `書類・テンプレート` / `補助金` / `提供素材` / `規約・約款` |
| 公開 | チェックボックス | チェックした記事だけサイトに出る |
| 概要 | テキスト | 一覧と検索結果に出る1〜2文の説明 |
| キーワード | マルチセレクト | 検索用の言い換え（例：しきい値 →「閾値」「残量」） |
| スラッグ | テキスト | URL の末尾（半角英数とハイフン。例：`threshold`）。空ならページ ID |
| 外部リンク | URL | Canva 資料・Google フォームなど、本文を持たずリンク先へ飛ばす記事に |
| 公開日 | 日付 | お知らせ・TIPS の日付（並び順に使う） |
| 並び順 | 数値 | 同じカテゴリ内の表示順（小さいほど上） |
| よく見られている | チェックボックス | トップの「よく見られている質問」に出す FAQ |

カテゴリの選択肢を増やすときは `src/lib/content/taxonomy.ts` にも追加します。

本文は Notion のページ本文がそのまま記事になります。対応ブロック：見出し・段落・箇条書き／番号付きリスト・トグル・コールアウト（オレンジ/赤/黄＝注意、緑＝補足、その他＝ポイント）・画像・動画（YouTube 埋め込み可）・表・列・ファイル・ブックマーク・区切り線。

### 2. インテグレーションを接続する

1. https://www.notion.so/profile/integrations で内部インテグレーションを作成し、トークンをコピー（**読み取り権限のみ**で十分）
2. 記事データベースの「…」→「接続」から、そのインテグレーションを追加
3. データベースの「…」→「データソースを管理」→ データソース ID をコピー
4. `.env.example` を `.env.local` にコピーして値を設定

```bash
NOTION_TOKEN=ntn_xxxxxxxx
NOTION_DATA_SOURCE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REVALIDATE_SECRET=（長いランダム文字列）
```

### 3. 更新の反映

- 何もしなくても **5分ごと** に Notion の内容で作り直します
- すぐ反映したいときは `/api/revalidate` を呼びます（Notion のオートメーション「Webhook を送信」に設定しておくと、更新時に自動で反映できます）

```bash
curl -X POST https://<サイトのドメイン>/api/revalidate -H "x-revalidate-secret: <REVALIDATE_SECRET>"
```

Notion の画像 URL は1時間で失効するため、画像は `/api/notion-file/[ブロックID]` を経由して都度新しい URL に転送しています（公開中の記事の画像だけ）。

## デザイン

Canva「デザイン引き継ぎのコピー」に準拠しています。

- フォント：Noto Sans JP
- 色：本文の濃紺、強調のオレンジ、水色〜青のグラデーション。
  白い文字を載せる面は WCAG AA（4.5:1）を満たすよう、元の色より少し濃い青にしています（`src/app/globals.css`）
- イラスト：Canva から書き出した PDF の線画を透過 PNG にしたもの（`public/illustrations/`、`src/components/illustration.tsx`）。
  カテゴリ・資料・お問い合わせ欄で使用。矢印・検索などの小さな UI アイコンは SVG（`src/components/icons.tsx`）

## 公開

Node.js が動くホスティング（Vercel、AWS Amplify、Cloud Run など）で `npm run build && npm run start`。
環境変数 `NOTION_TOKEN` / `NOTION_DATA_SOURCE_ID` / `REVALIDATE_SECRET` を設定してください。
Notion の内容を定期的に取り直すため、静的書き出し（`output: "export"`）ではなくサーバーで動かす構成です。
