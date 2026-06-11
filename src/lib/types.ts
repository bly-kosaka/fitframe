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

/** per-image の編集状態。出力px空間での配置を表す。 */
export interface Transform {
  /** 出力px空間での中心からのXオフセット */
  x: number;
  /** 出力px空間での中心からのYオフセット */
  y: number;
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

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

export interface ExportResult {
  id: string;
  name: string;
  bytes: number;
}

export type ExportPhase = "ready" | "processing" | "done";

export const defaultTransform = (): Transform => ({
  x: 0,
  y: 0,
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
});
