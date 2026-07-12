/**
 * マジックナンバー集約（制限値・UIの可動域・サムネ解像度等）。
 */

// ---------- セキュリティ / バリデーション（仕様書 §7） ----------
// いずれもブラウザが <img> でネイティブデコード可能な形式のみ。出力時は
// JPG/PNG/WebP へ再エンコードするため、入力を許可するだけで既存の書き出し
// パイプラインに乗る。GIF は 1 フレーム目のみ変換される（アニメは失われる）。
// ※ HEIC/HEIF は <img> でデコードできないため未対応（別途 WASM デコーダが必要）。
export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/bmp",
] as const;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_DIMENSION_PX = 10000; // 10000 x 10000 px まで
export const MAX_FILE_COUNT = 20; // 合計20枚まで

// ---------- 出力サイズ ----------
export const CUSTOM_SIZE_MIN = 1;
export const CUSTOM_SIZE_MAX = 10000;

// ---------- 出力プロファイル（複数サイズ展開） ----------
export const PROFILE_MIN_COUNT = 1; // バスケットは最低1件
export const PROFILE_MAX_COUNT = 20; // 上限の目安（仕様書 §7）
// 大量出力（画像数×プロファイル数）がこれを超えたら書き出し前に警告する
export const OUTPUT_COUNT_WARNING = 1000;

// ---------- per-image Transform の可動域 ----------
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 8;
export const ZOOM_STEP = 0.01;

export const ROTATION_MIN = -180;
export const ROTATION_MAX = 180;

// ---------- 角丸（rounded時、短辺に対する%） ----------
export const RADIUS_MIN = 2;
export const RADIUS_MAX = 50;

// ---------- JPEG/WebP 画質 ----------
export const QUALITY_MIN = 0.4;
export const QUALITY_MAX = 1;
export const QUALITY_STEP = 0.01;

// ---------- 一覧グリッドの密度スライダー ----------
export const GRID_CELL_MIN = 150;
export const GRID_CELL_MAX = 320;
export const GRID_CELL_DEFAULT = 220;

// ---------- プレビュー描画の縮小上限（負荷軽減。等倍書き出しには使わない） ----------
export const PREVIEW_MAX_DIM = 520; // 設定画面のライブプレビュー
export const STRIP_THUMB_MAX_DIM = 140; // 一括適用イメージのミニサムネ
export const EDITOR_STAGE_MAX_DIM = 1000; // 個別編集の大プレビュー
export const EDITOR_PANEL_THUMB_MAX_DIM = 300; // 個別編集パネルのサムネ
export const RESULT_THUMB_MAX_DIM = 160; // ダウンロード完了画面のサムネ

// ---------- トースト ----------
export const TOAST_DURATION_MS = 2600;

// ---------- ファイル名 ----------
export const FORBIDDEN_FILENAME_CHARS = /[\\/:*?"<>|]/g;

// ---------- メモリ安全性に関する警告閾値 ----------
// デコード後のビットマップ合計（width × height × 4byte）がこれを超えたら警告する
export const DECODED_MEMORY_WARNING_BYTES = 1.5 * 1024 * 1024 * 1024; // 約1.5GB
// 出力ZIPの推定合計サイズがこれを超えたら警告する
export const ZIP_SIZE_WARNING_BYTES = 500 * 1024 * 1024; // 500MB

// ---------- サンプル画像 ----------
export const DEMO_IMAGE_COUNT = 8;
