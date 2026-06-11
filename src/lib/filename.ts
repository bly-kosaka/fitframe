/**
 * 出力ファイル名解決（仕様書 §5.6）。
 * customName（個別上書き）を最優先し、なければファイル名ルールをトークン置換する。
 * 禁止文字を除去し、衝突時は `_2`, `_3`… を付与する。
 */

import { FORBIDDEN_FILENAME_CHARS } from "./constants";
import { FORMATS } from "./presets";
import type { ImageItem, OutputSettings } from "./types";

/** 拡張子なしの元ファイル名（最後の `.ext` を除去） */
function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

/** 出力形式に対応する拡張子（jpg/png/webp） */
export function resolveExtension(settings: OutputSettings): string {
  const fmt = FORMATS.find((f) => f.id === settings.format);
  return fmt ? fmt.ext : "png";
}

/**
 * 拡張子を除いた出力ファイル名（dedup 適用前）を解決する。
 * `customName` があればそれを優先し、なければ `namePattern` のトークンを置換する。
 */
export function resolveBaseName(
  item: ImageItem,
  settings: OutputSettings,
  index: number,
  total: number,
): string {
  let base: string;
  if (item.customName && item.customName.trim()) {
    base = stripExtension(item.customName.trim());
  } else {
    const orig = stripExtension(item.name);
    const pad = Math.max(2, String(total || 1).length);
    const seq = String(index + 1).padStart(pad, "0");
    base = (settings.namePattern || "{name}")
      .replace(/\{name\}/g, orig)
      .replace(/\{n\}/g, seq)
      .replace(/\{w\}/g, String(settings.width))
      .replace(/\{h\}/g, String(settings.height));
  }
  base = base.replace(FORBIDDEN_FILENAME_CHARS, "").trim();
  return base || "image";
}

/** 拡張子つきの出力ファイル名（dedup 適用前）を解決する */
export function resolveFileName(
  item: ImageItem,
  settings: OutputSettings,
  index: number,
  total: number,
): string {
  return `${resolveBaseName(item, settings, index, total)}.${resolveExtension(settings)}`;
}

/**
 * 全画像分の出力ファイル名を解決する。
 * 同名（拡張子込み）が衝突する場合は `_2`, `_3`… を付与して重複を回避する。
 */
export function resolveFileNames(items: ImageItem[], settings: OutputSettings): string[] {
  const ext = resolveExtension(settings);
  const total = items.length;
  const usedCounts = new Map<string, number>();

  return items.map((item, index) => {
    const base = resolveBaseName(item, settings, index, total);
    const used = usedCounts.get(base) ?? 0;
    usedCounts.set(base, used + 1);
    const finalBase = used === 0 ? base : `${base}_${used + 1}`;
    return `${finalBase}.${ext}`;
  });
}
