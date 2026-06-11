# FitFrame

複数の画像を指定サイズへ一括フィット（リサイズ／トリミング）し、ZIPでまとめてダウンロードできる画像加工ツールです。
**処理はすべてブラウザ内（Canvas + JSZip）で完結し、画像が外部サーバーへ送信されることはありません。**

## 概要

- アップロード → サイズ・形状・出力形式の設定 → 自動配置結果の確認・個別調整 → ZIPダウンロード、という単一画面のウィザード形式です。
- Cover / Contain / Stretchの3種のフィットモードと、四角・角丸・円・楕円の4種の出力形状（マスク）に対応します。
- 画像ごとに位置・拡大率・回転・反転・出力ファイル名を個別調整できます。
- 出力時にEXIF等のメタデータは常に削除されます（Canvas再エンコードによる再生成）。

## 機能

| 画面 | 内容 |
|---|---|
| アップロード | ドラッグ&ドロップ／ファイル選択で画像を追加。サンプル画像で試すことも可能 |
| サイズ設定 | 出力サイズ（プリセット／カスタム）、フィットモード、出力形状・角丸、出力形式（JPG/PNG/WebP）・画質、背景色、ファイル名ルールを設定 |
| 配置の確認 | 全画像の自動配置結果をグリッド／リスト表示。個別編集・リセット・削除・追加が可能 |
| 個別編集 | 1枚ずつ位置（ドラッグ）・拡大率（ホイール／スライダー）・回転・反転・出力ファイル名を調整 |
| ダウンロード | 設定内容の要約を確認し、ZIPを生成してダウンロード。書き出し進捗と完了後のサムネイル一覧を表示 |

## 制限値（バリデーション）

- 対応形式: JPEG / PNG / WebP（GIF等は非対応）
- 1ファイルあたり最大20MB
- 画像の最大サイズ: 10000 × 10000 px
- 合計アップロード枚数: 最大100枚

これらを超えるファイルはエラーとして表示され、それ以外の正常なファイルのみ処理が継続されます。

## 技術構成

- [Next.js](https://nextjs.org/)（App Router）/ React / TypeScript（strict mode）
- Tailwind CSS（デザイントークンベース）
- [react-dropzone](https://react-dropzone.js.org/)（アップロード）
- [JSZip](https://stuk.github.io/jszip/)（ZIP生成）
- 画像処理はCanvas 2D API（`src/lib/fit.ts` に集約した単一の描画エンジンを、サムネイル・プレビュー・編集・書き出しの全画面で共有）

## セットアップ

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm run start
```

このアプリは画像処理を含めサーバー機能（API Routes / Server Actions / 環境変数）を一切使用しません。

### 静的書き出し（Cloudflare Pages 等）

`STATIC_EXPORT=true` を指定してビルドすると `next.config.mjs` が `output: "export"` になり、`out/` ディレクトリに完全な静的サイトが生成されます。

```bash
STATIC_EXPORT=true npm run build
```

セキュリティヘッダー（CSP等）は通常モードでは `next.config.mjs` の `headers()` で付与されますが、
静的書き出しでは `headers()` が無効になるため、代わりに `public/_headers`（Cloudflare Pages形式）が `out/_headers` としてそのまま出力されます。

## デプロイ

本番環境は **Cloudflare Pages**（静的）のみです。

- ビルドコマンド: `STATIC_EXPORT=true npm run build`
- 出力ディレクトリ: `out`

CLIから手動デプロイする場合:

```bash
STATIC_EXPORT=true npm run build
npx wrangler pages deploy out --project-name fitframe
```

## 動作確認手順（E2E）

1. `npm run dev` でアプリを起動し、トップページを開く。
2. アップロード画面で「サンプル画像で試す」を選択し、サンプル画像を読み込む。または手元のJPG/PNG/WebP画像をドラッグ&ドロップする。
3. サイズ設定画面で出力サイズ・フィットモード・形状・出力形式を設定し、「確認へ進む」を選択する。
4. 配置の確認画面で自動配置結果を確認し、必要に応じて画像をクリックして個別編集画面で位置・拡大率・回転・反転・ファイル名を調整する。
5. 「ダウンロードへ進む」からダウンロード画面へ遷移し、「ZIPを生成してダウンロード」を選択する。
6. 進捗表示後にZIPファイルがダウンロードされ、完了画面に書き出し結果のサムネイルが表示されることを確認する。
