/**
 * ZIP 生成 + ダウンロード（仕様書 §5.7）。
 * 各画像を出力解像度で `lib/fit.ts` の renderToCanvas で描画 → toBlob → JSZip に追加し、
 * 1枚ごとに requestAnimationFrame で UI スレッドを解放しながら進捗を通知する。
 */

import JSZip from "jszip";

import { renderToCanvas } from "./fit";
import { resolveFileNames } from "./filename";
import type { ExportResult, ImageItem, OutputSettings } from "./types";

function canvasToBlob(canvas: HTMLCanvasElement, settings: OutputSettings): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality = settings.format === "image/png" ? undefined : settings.quality;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("画像の書き出しに失敗しました"));
      },
      settings.format,
      quality,
    );
  });
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Blob をファイルとしてダウンロードさせる */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ExportOptions {
  /** 1枚処理するごとに呼ばれる進捗コールバック */
  onProgress?: (done: number, total: number, result: ExportResult) => void;
}

export interface ExportZipResult {
  results: ExportResult[];
  zipBlob: Blob;
  zipName: string;
}

/** 全画像を出力解像度で描画し、ZIP にまとめてダウンロードする */
export async function exportZip(
  items: ImageItem[],
  settings: OutputSettings,
  options: ExportOptions = {},
): Promise<ExportZipResult> {
  const zip = new JSZip();
  const folderName = `fitframe_${settings.width}x${settings.height}`;
  const folder = zip.folder(folderName);
  if (!folder) {
    throw new Error("ZIP フォルダの作成に失敗しました");
  }

  const names = resolveFileNames(items, settings);
  const results: ExportResult[] = [];
  const canvas = document.createElement("canvas");

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const name = names[i];
    renderToCanvas(canvas, item.element, settings, item.transform);
    const blob = await canvasToBlob(canvas, settings);
    folder.file(name, blob);

    const result: ExportResult = { id: item.id, name, bytes: blob.size };
    results.push(result);
    options.onProgress?.(i + 1, items.length, result);

    await nextFrame();
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipName = `FitFrame_${settings.width}x${settings.height}_${items.length}imgs.zip`;
  triggerDownload(zipBlob, zipName);

  return { results, zipBlob, zipName };
}
