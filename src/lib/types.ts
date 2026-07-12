/**
 * FitFrame の主要型定義。
 * すべての画像処理はクライアントサイド（Canvas + JSZip）で完結する。
 */

export type FitMode = "cover" | "contain" | "stretch";
export type ShapeType = "rect" | "rounded" | "circle" | "ellipse";
export type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
export type Step = "upload" | "settings" | "list" | "edit" | "export";
export type ListLayout = "grid" | "rows";
export type ToastKind = "ok" | "warn";
export type RejectReason = "mime" | "size" | "dimension" | "count" | "decode";
/** ZIP のフォルダー構成（複数サイズ展開時） */
export type ZipLayout = "byLabel" | "byImage" | "flat";

/**
 * per-image の編集状態。
 * 位置は元画像に対する正規化フォーカルポイント（focus）で保持するため、
 * サイズ非依存で全出力プロファイルに波及する（仕様書 §2.2）。
 */
export interface Transform {
  /** 正規化フォーカルポイント（元画像に対する相対座標、0〜1。既定 0.5/0.5） */
  focus: { fx: number; fy: number };
  /** フィット基準スケールへの倍率（1 = 自動配置） */
  zoom: number;
  /** 度（-180〜180） */
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export interface ImageItem {
  id: string;
  file: File;
  /** 元ファイル名（拡張子を含む） */
  name: string;
  /** URL.createObjectURL(file)。削除/アンマウント時に revoke すること */
  objectUrl: string;
  element: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  transform: Transform;
  /** 個別ファイル名（拡張子なし）。未設定ならファイル名ルールを適用 */
  customName?: string;
  /** 自動配置から変更されたか */
  edited: boolean;
}

export interface RejectedFile {
  name: string;
  reason: RejectReason;
  message: string;
}

/**
 * 描画エンジン（lib/fit.ts）が受け取る「単一サイズ＋グローバル属性」のまとまり。
 * 複数サイズ展開では OutputConfig（プロファイル配列＋グローバル）から
 * プロファイルごとに toSettings() で合成して渡す（lib/presets.ts）。
 */
export interface OutputSettings {
  width: number;
  height: number;
  /** プリセットID または 'custom' */
  presetId: string;
  fit: FitMode;
  shape: ShapeType;
  /** rounded 時の角丸（短辺に対する%） */
  radius: number;
  format: OutputFormat;
  /** 0.4〜1.0（jpeg/webp のみ使用） */
  quality: number;
  /** '#rrggbb' または 'transparent' */
  background: string;
  /** 例 "{name}_{w}x{h}" */
  namePattern: string;
  /** MVP では常に false 固定（UI は非活性） */
  keepMetadata: boolean;
}

/**
 * 出力プロファイル（サイズ＋ラベル）。バスケットに複数持てる（仕様書 §2.1）。
 * fit/形状/形式/背景/画質などはグローバル（GlobalOutputSettings）で共通化する。
 */
export interface OutputProfile {
  id: string;
  /** 例 "PC" "SP" "サムネ"。ファイル名/フォルダー名に使用 */
  label: string;
  /** 1〜10000 */
  width: number;
  /** 1〜10000 */
  height: number;
  /** プリセット由来なら参照ID、カスタムは undefined */
  presetId?: string;
}

/** 全プロファイル共通のグローバル出力設定（仕様書 §2.1） */
export interface GlobalOutputSettings {
  fit: FitMode;
  shape: ShapeType;
  radius: number;
  format: OutputFormat;
  quality: number;
  background: string;
  /** トークンに {label} を追加（仕様書 §5） */
  namePattern: string;
  /** MVP は false 固定（既存踏襲） */
  keepMetadata: boolean;
  /** ZIP のフォルダー構成。既定 'byLabel'（仕様書 §6） */
  zipLayout: ZipLayout;
}

/** ストアの出力設定＝プロファイル配列＋グローバル（仕様書 §2.1） */
export interface OutputConfig {
  /** 最低1件。統一モードは length===1 */
  profiles: OutputProfile[];
  global: GlobalOutputSettings;
}

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

export interface ExportResult {
  /** 元画像ID */
  id: string;
  /** 出力プロファイルID */
  profileId?: string;
  name: string;
  bytes: number;
}

export type ExportPhase = "ready" | "processing" | "done";

export const defaultTransform = (): Transform => ({
  focus: { fx: 0.5, fy: 0.5 },
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
});
