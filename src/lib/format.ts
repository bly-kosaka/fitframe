import { FORMATS } from "./presets";
import type { OutputSettings } from "./types";

/** バイト数を人が読みやすい単位文字列に変換する */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const COMMON_RATIOS: ReadonlyArray<readonly [number, number]> = [
  [16, 9],
  [4, 3],
  [3, 2],
  [1, 1],
  [9, 16],
  [2, 3],
  [3, 4],
  [21, 9],
];

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** W×H からアスペクト比表示用のラベル（例: "16:9"）を生成する */
export function aspectLabel(w: number, h: number): string {
  const d = gcd(w, h) || 1;
  const aw = w / d;
  const ah = h / d;
  if (aw <= 40 && ah <= 40) {
    return `${aw}:${ah}`;
  }
  const r = w / h;
  let best: readonly [number, number] = COMMON_RATIOS[0];
  let bestErr = Infinity;
  for (const ratio of COMMON_RATIOS) {
    const err = Math.abs(ratio[0] / ratio[1] - r);
    if (err < bestErr) {
      bestErr = err;
      best = ratio;
    }
  }
  if (bestErr < 0.04) return `${best[0]}:${best[1]}`;
  return `${r.toFixed(2).replace(/\.?0+$/, "")}:1`;
}

/** 出力1枚あたりのファイルサイズの概算（プレビュー表示用ヒューリスティック） */
export function estimateBytes(settings: OutputSettings): number {
  const px = settings.width * settings.height;
  const fmt = FORMATS.find((f) => f.id === settings.format);
  let bitsPerPixel = 0.5;
  if (fmt) {
    if (fmt.ext === "jpg") bitsPerPixel = 0.16 + settings.quality * 0.22;
    else if (fmt.ext === "webp") bitsPerPixel = 0.1 + settings.quality * 0.16;
    else bitsPerPixel = 1.1;
  }
  return Math.round(px * bitsPerPixel);
}
